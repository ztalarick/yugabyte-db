//--------------------------------------------------------------------------------------------------
// Copyright (c) YugaByte, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.  You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied.  See the License for the specific language governing permissions and limitations
// under the License.
//
//--------------------------------------------------------------------------------------------------

#include "yb/yql/pggate/pg_metrics.h"

namespace yb {

namespace pggate {

void SubtractExecStats(YBCPgExecStats *from, YBCPgExecStats *amount, YBCPgExecStats *result) {
    #define SUBTRACT_1_METRIC(field) \
        result->field = from->field - amount->field \

    #define SUBTRACT_2_METRICS(field1, field2) \
        result->field1 = from->field1 - amount->field1; \
        result->field2 = from->field2 - amount->field2; \

    #define SUBTRACT_3_METRICS(field1, field2, field3) \
        result->field1 = from->field1 - amount->field1; \
        result->field2 = from->field2 - amount->field2; \
        result->field3 = from->field3 - amount->field3; \

    // Read stats
    SUBTRACT_2_METRICS(num_table_reads, table_read_wait);
    SUBTRACT_2_METRICS(num_index_reads, index_read_wait);
    SUBTRACT_2_METRICS(num_catalog_reads, catalog_read_wait);

    // Write and flush stats
    SUBTRACT_3_METRICS(num_table_writes, num_index_writes, num_catalog_writes);
    SUBTRACT_2_METRICS(num_flushes, flush_wait);

    #undef SUBTRACT_3_METRICS
    #undef SUBTRACT_1_METRIC
    #undef SUBTRACT_2_METRICS
}

void RefreshExecStats(YBCPgExecStats *current, YBCPgExecStats *snapshot,
                      YBCQueryExecutionPhase phase) {
  #define COPY_METRIC_VALUES(field) snapshot->field = current->field;
  #define COPY_2_METRIC_VALUES(field1, field2) \
    snapshot->field1 = current->field1; \
    snapshot->field2 = current->field2; \

  switch (phase) {
    case BEFORE_EXECUTOR_START:
      // Reset all user table and index table reads.
      COPY_2_METRIC_VALUES(num_table_reads, table_read_wait);
      COPY_2_METRIC_VALUES(num_index_reads, index_read_wait);

      // Reset all writes
      COPY_2_METRIC_VALUES(num_table_writes, num_index_writes);
      COPY_2_METRIC_VALUES(num_catalog_writes, catalog_write_wait);
      COPY_2_METRIC_VALUES(num_flushes, flush_wait);

      // Catalog read related stats must not be reset here because most catalog lookups for a
      // given query happend between (AFTER_EXECUTOR_END(N-1) to BEFORE_EXECUTOR_START(N)] where
      // 'N' is the currently executing query in the session that we are interested in.

      break;

    case EXECUTION:
    case AFTER_EXECUTOR_END:
      // Reset all metrics except the ones that are executed async to Postgres execution framework
      // (for example: flushes). This is because Postgres invokes instrumentation corresponding
      // to the end of execution (EndPlan() and EndExecutor()) before the flushes complete

      // User table and Index table reads
      COPY_2_METRIC_VALUES(num_table_reads, table_read_wait);
      COPY_2_METRIC_VALUES(num_index_reads, index_read_wait);

      // Non catalog Write counts
      COPY_2_METRIC_VALUES(num_table_writes, num_index_writes);

      // Catalog accesses
      COPY_2_METRIC_VALUES(num_catalog_reads, catalog_read_wait);

      break;
  }

  #undef COPY_2_METRIC_VALUES
  #undef COPY_METRIC_VALUE
}

} // namespace pggate

} // namespace yb
