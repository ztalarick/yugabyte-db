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

    void Reset();
    void IncrementCountBy(uint64_t count);
} RpcStats;

class PgDocMetrics : public RefCountedThreadSafe<PgDocMetrics> {
public:
    PgDocMetrics(MetricRegistry* registry, const std::string& id);
    virtual ~PgDocMetrics();

    std::string MetricId() { return entity_->id(); } /* TODO: Remove this */
    void Reset(); /* Resets all counter-based metrics */
    uint64_t GetNumTableReadRequests();
    uint64_t GetNumTableWriteRequests();
    uint64_t GetNumIndexReadRequests() { return index_reads.count->value(); }
    uint64_t GetNumIndexWriteRequests() { return index_writes.count->value(); }
    uint64_t GetNumCatalogReadRequests() { return catalog_reads.count->value(); }
    uint64_t GetNumCatalogWriteRequests() { return catalog_writes.count->value(); }

    void AddDocOpRequest(master::RelationType relation, bool is_read, uint64_t parallelism);
    void IncrementExecutionTime(master::RelationType relation, bool is_read, uint64_t wait_time);
    void GetStats(YBCPgExecStats *stats);

    uint64_t GetDocDBMinParallelism() { return min_parallelism->value(); }
    uint64_t GetDocDBMaxParallelism() { return max_parallelism->value(); }

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

    scoped_refptr<AtomicGauge<uint64_t>> min_parallelism;
    scoped_refptr<AtomicGauge<uint64_t>> max_parallelism;

    scoped_refptr<MetricEntity> entity_;
};

} // pggate
} // yb
