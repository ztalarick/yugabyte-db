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

#pragma once

#include "yb/master/master_types.pb.h"
#include "yb/util/logging.h"
#include "yb/util/metrics.h"
#include "yb/yql/pggate/ybc_pg_typedefs.h"

namespace yb {
namespace pggate {

typedef struct RpcStats {
    scoped_refptr<Counter> count;
    scoped_refptr<AtomicGauge<uint64_t>> exec_time;

    RpcStats();
    RpcStats(scoped_refptr<MetricEntity>, CounterPrototype *, GaugePrototype<uint64_t> *);
    virtual ~RpcStats();

    void Reset() const;
    void IncrementCountBy(uint64_t count) const;

private:
    void CopyFrom(const RpcStats &);
} RpcStats;

class PgDocMetrics {
 public:
    PgDocMetrics(MetricRegistry* registry, const std::string& id);
    virtual ~PgDocMetrics();

    void AddDocOpRequest(master::RelationType relation, bool is_read, uint64_t parallelism);
    void AddFlushRequest(uint64_t wait_time) const;
    void IncrementExecutionTime(master::RelationType relation, bool is_read, uint64_t wait_time);
    void GetStats(YBCPgExecStats *stats);
    void Reset(); /* Resets all counter-based metrics */

 private:
    // User table metrics
    RpcStats table_reads;
    RpcStats table_writes;

    // Secondary index metrics
    RpcStats index_reads;
    RpcStats index_writes;

    // Catalog metrics
    RpcStats catalog_reads;
    RpcStats catalog_writes;

    // Flush metrics
    RpcStats flushes;

    scoped_refptr<MetricEntity> entity_;
};

} // namespace pggate
} // namespace yb
