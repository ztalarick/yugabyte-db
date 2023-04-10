package org.yb.pgsql;

import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_SEQ_SCAN;

import java.sql.Statement;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.yb.pgsql.ExplainAnalyzeUtils.PlanCheckerBuilder;
import org.yb.pgsql.ExplainAnalyzeUtils.TopLevelCheckerBuilder;
import org.yb.util.json.AbsenceChecker;
import org.yb.util.json.Checker;
import org.yb.util.json.Checkers;
import org.yb.util.json.JsonUtil;

public class TestPgExplainAnalyzeScans extends TestPgExplainAnalyze {
  private static final String FOO_TABLE = "foo";
  private static final String BAR_TABLE = "bar";
  private static final String FOO_RANGE_MC_INDEX = "foo_v1_v2"; // Multi-column Range Index on foo
  private static final String FOO_HASH_INDEX = "foo_v3";
  private static final String FOO_RANGE_INDEX = "foo_v4";
  private static final int NUM_PAGES = 10;
  private TopLevelCheckerBuilder SCAN_TOP_LEVEL_CHECKER = makeTopLevelBuilder()
      .storageWriteRequests(Checkers.equal(0))
      .storageFlushesRequests(Checkers.equal(0))
      .catalogReadsRequests(Checkers.greaterOrEqual(0))
      // .catalogReadsExecutionTime(Checkers.greater(0))
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
          + "v2 INT, v3 INT, v4 INT, v5 INT);", FOO_TABLE));

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

    }
  }

  private TopLevelCheckerBuilder makeTopLevelBuilder() {

    return JsonUtil.makeCheckerBuilder(TopLevelCheckerBuilder.class, false);
  }

  private static PlanCheckerBuilder makePlanBuilder() {
    return JsonUtil.makeCheckerBuilder(PlanCheckerBuilder.class, false);
  }

  @Test
  public void testSeqScan() throws Exception {
    String simpleQuery = String.format("SELECT * FROM %s", FOO_TABLE);
    String queryWithExpr = String.format("SELECT * FROM %s WHERE v5 < 1024", FOO_TABLE);

    PlanCheckerBuilder SEQ_SCAN_PLAN = makePlanBuilder()
        .nodeType(NODE_SEQ_SCAN)
        .relationName(FOO_TABLE)
        .alias(FOO_TABLE)
        .storageTableReadExecutionTime(Checkers.greater(0.0))
        .storageIndexReadRequests(AbsenceChecker.absent());

    // Simple Seq Scan
    Checker checker = SCAN_TOP_LEVEL_CHECKER
      .storageReadRequests(Checkers.equal(NUM_PAGES))
      .storageReadExecutionTime(Checkers.greater(0))
      .plan(SEQ_SCAN_PLAN
        .storageTableReadRequests(Checkers.equal(NUM_PAGES))
        .build())
      .build();

    testExplain(simpleQuery, checker);

    // Seq Scan with Pushdown
    Checker pushdown_checker = SCAN_TOP_LEVEL_CHECKER
        .storageReadRequests(Checkers.equal(NUM_PAGES))
        .storageReadExecutionTime(Checkers.greater(0))
        .plan(SEQ_SCAN_PLAN
          .storageTableReadRequests(Checkers.equal(NUM_PAGES))
          .build())
        .build();

    testExplain(queryWithExpr, pushdown_checker);

    // Seq Scan without Pushdown
    try (Statement stmt = connection.createStatement()) {
      stmt.execute("SET yb_enable_expression_pushdown TO false");
      ExplainAnalyzeUtils.testExplain(stmt, queryWithExpr, pushdown_checker);
      stmt.execute("SET yb_enable_expression_pushdown TO true");
    }

  }

}
