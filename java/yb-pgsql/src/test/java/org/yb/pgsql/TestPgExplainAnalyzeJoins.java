package org.yb.pgsql;

import java.util.Map;

import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_HASH;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_HASH_JOIN;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_INDEX_SCAN;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_NESTED_LOOP;
import static org.yb.pgsql.ExplainAnalyzeUtils.NODE_SEQ_SCAN;
import static org.yb.pgsql.ExplainAnalyzeUtils.RELATIONSHIP_OUTER_TABLE;
import static org.yb.pgsql.ExplainAnalyzeUtils.RELATIONSHIP_INNER_TABLE;

import org.junit.Before;
import org.junit.Test;
import org.yb.pgsql.ExplainAnalyzeUtils.PlanCheckerBuilder;
import org.yb.pgsql.ExplainAnalyzeUtils.TopLevelCheckerBuilder;
import org.yb.util.json.Checker;
import org.yb.util.json.Checkers;

public class TestPgExplainAnalyzeJoins extends TestPgExplainAnalyzeScans {
  private TopLevelCheckerBuilder JOINS_TOP_LEVEL_CHECKER = makeTopLevelBuilder()
    .storageWriteRequests(Checkers.equal(0))
    .storageFlushesRequests(Checkers.equal(0))
    .catalogWritesRequests(Checkers.equal(0));

  @Override
  protected Map<String, String> getTServerFlags() {
    return super.getTServerFlags();
  }

  @Before
  public void setUp() throws Exception {
    super.setUp();
  }

  @Test
  public void testHashJoin() throws Exception {
    String simpleHashJoin = "/*+ HashJoin(%1$s %2$s) Leading((%1$s %2$s)) */ SELECT * FROM %1$s "
    + "JOIN %2$s ON %1$s.%3$s = %2$s.%4$s %5$s;";

    PlanCheckerBuilder hashJoinNodeChecker = makePlanBuilder()
      .nodeType(NODE_HASH_JOIN)
      .storageTableWriteRequests(Checkers.absent())
      .storageIndexWriteRequests(Checkers.absent());

    // 1. Simple Hash Join
    PlanCheckerBuilder outerTableScanChecker = makePlanBuilder()
      .nodeType(NODE_SEQ_SCAN)
      .relationName(FOO_TABLE)
      .alias(FOO_TABLE)
      .parentRelationship(RELATIONSHIP_OUTER_TABLE)
      .storageTableReadExecutionTime(Checkers.greater(0.0))
      .storageIndexReadRequests(Checkers.absent());

    PlanCheckerBuilder innerTableHashChecker = makePlanBuilder()
      .nodeType(NODE_HASH)
      .parentRelationship(RELATIONSHIP_INNER_TABLE)
      .storageTableReadRequests(Checkers.absent());

    PlanCheckerBuilder innerTableScanChecker = makePlanBuilder()
      .nodeType(NODE_SEQ_SCAN)
      .relationName(BAR_TABLE)
      .alias(BAR_TABLE)
      .storageTableReadExecutionTime(Checkers.greater(0.0))
      .storageIndexReadRequests(Checkers.absent());

    Checker checker1 = JOINS_TOP_LEVEL_CHECKER
      .plan(hashJoinNodeChecker
        .plans(
          outerTableScanChecker
            .storageTableReadRequests(Checkers.equal(NUM_PAGES + 1))
            .build(),
          innerTableHashChecker
            .plans(innerTableScanChecker
              .storageTableReadRequests(Checkers.equal(NUM_PAGES))
              .build())
            .build())
        .build())
      .build();

    testExplain(String.format(simpleHashJoin, FOO_TABLE, BAR_TABLE, "k", "v1", ""), checker1);

    // 2. Hash Join with Index Scan
    PlanCheckerBuilder innerTableIndexScanChecker = makePlanBuilder()
      .nodeType(NODE_INDEX_SCAN)
      .relationName(BAR_TABLE)
      .alias(BAR_TABLE)
      .storageIndexReadRequests(Checkers.equal(1))
      .storageIndexReadExecutionTime(Checkers.greater(0.0))
      .storageTableReadRequests(Checkers.absent());

    Checker checker2 = JOINS_TOP_LEVEL_CHECKER
      .plan(hashJoinNodeChecker
        .plans(
          outerTableScanChecker
            .storageTableReadRequests(Checkers.equal(1))
            .build(),
          innerTableHashChecker
            .plans(innerTableIndexScanChecker
              .build())
            .build())
        .build())
      .build();

    testExplain(String.format(simpleHashJoin, FOO_TABLE, BAR_TABLE, "k", "v1",
      "AND foo.k < 10 AND bar.k1 < 10"), checker2);
  }

  @Test
  public void testNestedLoopJoin() throws Exception {
    String simpleNLQuery = "/*+ NestLoop(%1$s %2$s) Leading((%1$s %2$s)) */ SELECT * FROM %1$s "
      + " JOIN %2$s ON %1$s.%3$s = %2$s.%4$s %5$s";

    // 1. Simple Nested Loop
    PlanCheckerBuilder nestedLoopNodeChecker = makePlanBuilder()
      .nodeType(NODE_NESTED_LOOP)
      .storageTableWriteRequests(Checkers.absent())
      .storageTableReadRequests(Checkers.absent())
      .storageIndexWriteRequests(Checkers.absent())
      .storageIndexReadRequests(Checkers.absent());

    PlanCheckerBuilder outerTableSeqScanChecker = makePlanBuilder()
      .nodeType(NODE_SEQ_SCAN)
      .relationName(FOO_TABLE)
      .alias(FOO_TABLE)
      .parentRelationship(RELATIONSHIP_OUTER_TABLE)
      .storageTableReadExecutionTime(Checkers.greater(0.0))
      .storageIndexReadRequests(Checkers.absent());

    PlanCheckerBuilder innerTableIndexScanChecker = makePlanBuilder()
      .nodeType(NODE_INDEX_SCAN)
      .relationName(BAR_TABLE)
      .alias(BAR_TABLE)
      .parentRelationship(RELATIONSHIP_INNER_TABLE)
      .storageTableReadRequests(Checkers.absent())
      .storageIndexReadRequests(Checkers.equal(2))
      .storageIndexReadExecutionTime(Checkers.greater(0.0))
      .storageTableReadRequests(Checkers.absent());

    Checker checker1 = JOINS_TOP_LEVEL_CHECKER
      .plan(nestedLoopNodeChecker
        .plans(outerTableSeqScanChecker
            .storageTableReadRequests(Checkers.equal(1))
            .build(),
          innerTableIndexScanChecker
            .actualLoops(Checkers.equal(10))
            .build())
        .build())
      .build();

    testExplain(String.format(simpleNLQuery, FOO_TABLE, BAR_TABLE, "k", "v1",
      "AND foo.k < 10"), checker1);
  }
}
