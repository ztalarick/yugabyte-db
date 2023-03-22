#pragma once

#include "yb/master/master_types.pb.h"
#include "yb/util/logging.h"
#include "yb/util/metrics.h"
#include "yb/yql/pggate/ybc_pg_typedefs.h"

namespace yb {
namespace pggate {

class PgDocMetrics {
public:
    PgDocMetrics(MetricRegistry* registry, const std::string& id);
    virtual ~PgDocMetrics();

    void Reset(); /* Resets all counter-based metrics */
    uint64_t GetNumTableReadRequests();
    uint64_t GetNumTableWriteRequests();
    void AddDocOpRequest(master::RelationType relation, bool is_read, uint64_t parallelism);
    void GetStats(YBCPgExecStats *stats);

    uint64_t GetDocDBMinParallelism() { return min_parallelism->value(); }
    uint64_t GetDocDBMaxParallelism() { return max_parallelism->value(); }

    // User table metrics
    scoped_refptr<Counter> table_reads;
    scoped_refptr<Counter> table_writes;

    // Secondary index metrics
    scoped_refptr<Counter> index_reads;
    scoped_refptr<Counter> index_writes;

    // Catalog metrics
    scoped_refptr<Counter> catalog_reads;
    scoped_refptr<Counter> catalog_writes;

    scoped_refptr<MetricEntity> entity_;

private:
    scoped_refptr<AtomicGauge<uint64_t>> min_parallelism;
    scoped_refptr<AtomicGauge<uint64_t>> max_parallelism;
};

} // pggate
} // yb
