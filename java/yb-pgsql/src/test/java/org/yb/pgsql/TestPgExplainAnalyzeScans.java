package org.yb.pgsql;

import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_INDEX_SCAN;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_SEQ_SCAN;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_YB_SEQ_SCAN;

import java.sql.Statement;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.yb.YBTestRunner;
import org.yb.pgsql.ExplainAnalyzeUtils.PlanCheckerBuilder;
import org.yb.pgsql.ExplainAnalyzeUtils.TopLevelCheckerBuilder;
import org.yb.util.json.Checker;
import org.yb.util.json.Checkers;
import org.yb.util.json.JsonUtil;

@RunWith(value=YBTestRunner.class)
public class TestPgExplainAnalyzeScans extends TestPgExplainAnalyze {
  protected static final String FOO_TABLE = "foo";
  protected static final String BAR_TABLE = "bar";
  protected static final String FOO_RANGE_MC_INDEX = "foo_v1_v2"; // Multi-column Range Index on foo
  protected static final String FOO_HASH_INDEX = "foo_v3";
  protected static final String FOO_RANGE_INDEX = "foo_v4";
  protected static final String BAR_HASH_INDEX = "bar_v1";
  protected static final String BAR_RANGE_INDEX = "bar_v2";
  protected static final int NUM_PAGES = 10;
  protected TopLevelCheckerBuilder SCAN_TOP_LEVEL_CHECKER = makeTopLevelBuilder()
      .storageWriteRequests(Checkers.equal(0))
      .storageFlushesRequests(Checkers.equal(0))
      .catalogWritesRequests(Checkers.equal(0));


  @Override
  protected Map<String, String> getTServerFlags() {
    Map<String, String> flagMap = super.getTServerFlags();
    flagMap.put("ysql_prefetch_limit", "1024");
    flagMap.put("TEST_use_monotime_for_rpc_wait_time", "true");
    return flagMap;
  }

  @Before
  public void setUp() throws Exception {
    try (Statement stmt = connection.createStatement()) {
      stmt.execute(String.format("CREATE TABLE %s (k INT PRIMARY KEY, v1 INT, "
          + "v2 INT, v3 INT, v4 INT, v5 INT) SPLIT INTO 2 TABLETS", FOO_TABLE));

      // Multi-column Range Index on (v1, v2)
      stmt.execute(String.format("CREATE INDEX %s ON %s (v1, v2 ASC)",
        FOO_RANGE_MC_INDEX, FOO_TABLE));

      // Hash Index on v3
      stmt.execute(String.format("CREATE INDEX %s ON %s (v3 HASH)",
        FOO_HASH_INDEX, FOO_TABLE));

      // Range Index on v4
      stmt.execute(String.format("CREATE INDEX %s ON %s (v4 ASC)",
        FOO_RANGE_INDEX, FOO_TABLE));

      // Populate the table
      stmt.execute(String.format("INSERT INTO %s (SELECT i, i, i %% 1024, i, i, "
        + "i %% 128 FROM generate_series(0, %d) i)", FOO_TABLE, (NUM_PAGES * 1024 - 1)));

      // Create table 'bar'
      stmt.execute(String.format("CREATE TABLE %s (k1 INT, k2 INT, v1 INT, "
          +"v2 INT, v3 INT, PRIMARY KEY (k1 ASC, k2 DESC));", BAR_TABLE));

      // Hash Index on v1
      stmt.execute(String.format("CREATE INDEX %s ON %s (v1 HASH)",
        BAR_HASH_INDEX, BAR_TABLE));

      // Range Index on v2.
      stmt.execute(String.format("CREATE INDEX %s ON %s (v2 ASC);",
        BAR_RANGE_INDEX, BAR_TABLE));

      // Populate the table
      stmt.execute(String.format("INSERT INTO %s (SELECT i, i %% 128, i, i %% 1024, i "
        + "FROM generate_series(0, %d) i)", BAR_TABLE, (NUM_PAGES * 1024 - 1)));
    }
  }

  protected TopLevelCheckerBuilder makeTopLevelBuilder() {
    return JsonUtil.makeCheckerBuilder(TopLevelCheckerBuilder.class, false);
  }

  protected static PlanCheckerBuilder makePlanBuilder() {
    return JsonUtil.makeCheckerBuilder(PlanCheckerBuilder.class, false);
  }

  @Test
  public void testSeqScan() throws Exception {
    final String simpleQuery = String.format("SELECT * FROM %s", FOO_TABLE);
    final String queryWithExpr = String.format("SELECT * FROM %s WHERE v5 < 128", FOO_TABLE);

    PlanCheckerBuilder SEQ_SCAN_PLAN = makePlanBuilder()
        .nodeType(NODE_SEQ_SCAN)
        .relationName(FOO_TABLE)
        .alias(FOO_TABLE)
        .storageTableReadExecutionTime(Checkers.greater(0.0))
        .storageIndexReadRequests(Checkers.absent());

    // Simple Seq Scan
    Checker checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(NUM_PAGES + 1))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(NUM_PAGES + 1))
        .build())
      .build();

    testExplain(simpleQuery, checker);

    // Seq Scan with Pushdown
    Checker pushdown_checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(6))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(6))
        .build())
      .build();

    testExplain(queryWithExpr, pushdown_checker);

    // Seq Scan without Pushdown
    Checker no_pushdown_checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(NUM_PAGES + 1))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(NUM_PAGES + 1))
        .build())
      .build();

    try (Statement stmt = connection.createStatement()) {
      stmt.execute("SET yb_enable_expression_pushdown TO false");
      ExplainAnalyzeUtils.testExplain(stmt, queryWithExpr, no_pushdown_checker);
      stmt.execute("SET yb_enable_expression_pushdown TO true");
    }

  }

  @Test
  public void testYbSeqScan() throws Exception {
    final String simpleQuery = String.format("/*+ SeqScan(foo) */ SELECT * FROM %s;",
      FOO_TABLE);
    final String queryWithExpr = String.format("/*+ SeqScan(foo) */ SELECT * FROM %s "
      + "WHERE v5 < 64", FOO_TABLE);

    PlanCheckerBuilder YB_SEQ_SCAN_PLAN = makePlanBuilder()
      .nodeType(NODE_YB_SEQ_SCAN)
      .relationName(FOO_TABLE)
      .alias(FOO_TABLE)
      .storageTableReadExecutionTime(Checkers.greater(0.0))
      .storageIndexReadRequests(Checkers.absent());

    // 1. Simple YB Seq Scan
    Checker checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(NUM_PAGES + 1))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(YB_SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(NUM_PAGES + 1))
        .build())
      .build();

    testExplain(simpleQuery, checker);

    // 2. YB Seq Scan with Pushdown
    Checker pushdown_checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(3))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(YB_SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(3))
        .build())
      .build();

      testExplain(queryWithExpr, pushdown_checker);

      // 3. Seq Scan without Pushdown
    Checker no_pushdown_checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(NUM_PAGES + 1))
      .storageReadExecutionTime(Checkers.greater(0.0))
      .plan(YB_SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(NUM_PAGES + 1))
        .build())
      .build();

    try (Statement stmt = connection.createStatement()) {
      stmt.execute("SET yb_enable_expression_pushdown TO false");
      ExplainAnalyzeUtils.testExplain(stmt, queryWithExpr, no_pushdown_checker);
      stmt.execute("SET yb_enable_expression_pushdown TO true");
    }

  }

  @Test
  public void testIndexScan() throws Exception {
      final String simpleIndexQuery = "SELECT * FROM %s WHERE %s = 128;";
      final String indexQueryWithPredicate = "/*+ IndexScan(%s %s) */ SELECT * FROM %s WHERE "
        + "%s < 128;";

      PlanCheckerBuilder indexScanPlan = makePlanBuilder()
        .nodeType(NODE_INDEX_SCAN)
        .storageIndexReadExecutionTime(Checkers.greater(0.0));

      // 1. Simple Primary Hash Index Scan
      Checker checker1 = SCAN_TOP_LEVEL_CHECKER
        .storageReadRequests(Checkers.equal(1))
        .storageReadExecutionTime(Checkers.greater(0.0))
        .plan(indexScanPlan
          .storageIndexReadRequests(Checkers.equal(1))
          .storageTableReadRequests(Checkers.absent())
          .build())
        .build();

      testExplain(String.format(simpleIndexQuery, FOO_TABLE, "k"), checker1);

      // 2. Simple Primary Range Index Scan
      testExplain(String.format(simpleIndexQuery, BAR_TABLE, "k1"), checker1);

      // 3. Simple Secondary Range Index Scan
      Checker checker2 = SCAN_TOP_LEVEL_CHECKER
        .storageReadRequests(Checkers.equal(2))
        .storageReadExecutionTime(Checkers.greater(0.0))
        .plan(indexScanPlan
          .storageIndexReadRequests(Checkers.equal(2))
          .build())
        .build();

      testExplain(String.format(simpleIndexQuery, FOO_TABLE, "v1"), checker2);

      // 4. Index Scan with Inequality Predicate
      Checker checker3 = SCAN_TOP_LEVEL_CHECKER
        .storageReadRequests(Checkers.equal(2))
        .storageReadExecutionTime(Checkers.greater(0.0))
        .plan(indexScanPlan
          .storageIndexReadRequests(Checkers.equal(2))
          .storageTableReadRequests(Checkers.absent())
          .build())
        .build();

      testExplain(String.format(indexQueryWithPredicate, FOO_TABLE, FOO_RANGE_INDEX,
        FOO_TABLE, "v4"), checker3);

  }

}
