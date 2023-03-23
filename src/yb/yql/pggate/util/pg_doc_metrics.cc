#include "yb/yql/pggate/util/pg_doc_metrics.h"

METRIC_DEFINE_entity(pg_doc_request);

METRIC_DEFINE_counter(
    pg_doc_request, docdb_index_reads, "Number of DocDB index reads", yb::MetricUnit::kRequests,
    "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_index_writes, "Number of DocDB index writes", yb::MetricUnit::kRequests,
    "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_table_reads, "Number of DocDB table reads", yb::MetricUnit::kRequests,
    "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_table_writes, "Number of DocDB index writes", yb::MetricUnit::kRequests,
    "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_catalog_reads, "Number of system catalog reads", yb::MetricUnit::kRequests,
    "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_catalog_writes, "Number of system catalog writes", yb::MetricUnit::kRequests,
    "Desc goes here");

METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_table_read_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_index_read_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_catalog_read_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_table_write_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_index_write_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_catalog_write_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_min_parallelism, "Minimum number of requests batched to DocDB",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_max_parallelism, "Maximum number of requests batched to DocDB",
    yb::MetricUnit::kRequests, "Desc goes here");

namespace yb {
namespace pggate {

void RpcStats::Reset() {
    count->ResetValue();
    exec_time->set_value(0);
}

void RpcStats::IncrementCountBy(uint64_t num) {
    count->IncrementBy(num);
}

PgDocMetrics::PgDocMetrics(MetricRegistry* registry, const std::string& id) {
    entity_ = METRIC_ENTITY_pg_doc_request.Instantiate(registry, id);
    
    // User table metrics
    table_reads = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_table_reads),
        entity_->FindOrCreateGauge(&METRIC_docdb_table_read_wait, static_cast<uint64>(0))
    };

    table_writes = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_table_writes),
        entity_->FindOrCreateGauge(&METRIC_docdb_table_write_wait, static_cast<uint64>(0))
    };

    // Secondary index metrics
    index_reads = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_index_reads),
        entity_->FindOrCreateGauge(&METRIC_docdb_index_read_wait, static_cast<uint64>(0))
    };

    index_writes = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_index_writes),
        entity_->FindOrCreateGauge(&METRIC_docdb_index_write_wait, static_cast<uint64>(0))
    };

    // Catalog metrics
    catalog_reads = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_catalog_reads),
        entity_->FindOrCreateGauge(&METRIC_docdb_catalog_read_wait, static_cast<uint64>(0))
    };

    catalog_writes = RpcStats {
        entity_->FindOrCreateCounter(&METRIC_docdb_catalog_writes),
        entity_->FindOrCreateGauge(&METRIC_docdb_catalog_write_wait, static_cast<uint64>(0))
    };

    min_parallelism = entity_->FindOrCreateGauge(&METRIC_docdb_min_parallelism, static_cast<uint64>(1));
    max_parallelism = entity_->FindOrCreateGauge(&METRIC_docdb_max_parallelism, static_cast<uint64>(1));
}

PgDocMetrics::~PgDocMetrics() = default;

void PgDocMetrics::Reset() {
    // LOG(INFO) << Format("Stats: UT($0, $1, $6), IND($2, $3, $7), CAT($4, $5, $8)",
    //     table_reads.count->value(), table_writes.count->value(),
    //     index_reads.count->value(), index_writes.count->value(),
    //     catalog_reads.count->value(), catalog_writes.count->value(),
    //     table_reads.exec_time->value(), index_reads.exec_time->value(), catalog_reads.exec_time->value()
    // );

    // User table metrics
    table_reads.Reset();
    table_writes.Reset();

    // Secondary index metrics
    index_reads.Reset();
    index_writes.Reset();

    // Catalog metrics
    catalog_reads.Reset();
    catalog_writes.Reset();

    min_parallelism->set_value(1);
    max_parallelism->set_value(1);
}

uint64_t PgDocMetrics::GetNumTableReadRequests() {
    return table_reads.count->value();
}

uint64_t PgDocMetrics::GetNumTableWriteRequests() {
    return table_writes.count->value();
}

void PgDocMetrics::GetStats(YBCPgExecStats *stats) {
    // User table metrics
    stats->num_table_reads = GetNumTableReadRequests();
    stats->table_read_wait = table_reads.exec_time->value();
    stats->num_table_writes = GetNumTableWriteRequests();
    stats->table_write_wait = table_writes.exec_time->value();

    // Secondary Index metrics
    stats->num_index_reads = GetNumIndexReadRequests();
    stats->index_read_wait = index_reads.exec_time->value();
    stats->num_index_writes = GetNumIndexWriteRequests();
    stats->index_write_wait = index_writes.exec_time->value();

    // Catalog metrics
    stats->num_catalog_reads = GetNumCatalogReadRequests();
    stats->catalog_read_wait = catalog_reads.exec_time->value();
    stats->num_catalog_writes = GetNumCatalogWriteRequests();
    stats->catalog_write_wait = catalog_writes.exec_time->value();

    stats->min_parallelism = min_parallelism->value();
    stats->max_parallelism = max_parallelism->value(); 
}

void PgDocMetrics::AddDocOpRequest(master::RelationType relation, bool is_read, uint64_t parallelism) {
    // TODO: Scoped_refptr of count
    
    switch (relation) {
        case master::SYSTEM_TABLE_RELATION:
            is_read ? catalog_reads.IncrementCountBy(parallelism) : catalog_writes.IncrementCountBy(parallelism);
            break;
        case master::USER_TABLE_RELATION:
            is_read ? table_reads.IncrementCountBy(parallelism) : table_writes.IncrementCountBy(parallelism);
            break;
        case master::INDEX_TABLE_RELATION:
            is_read ? index_reads.IncrementCountBy(parallelism) : index_writes.IncrementCountBy(parallelism);
            break;
        default:
            LOG(WARNING) << "Unhandled relation type " << relation;
    }

    min_parallelism->set_value(std::min<uint64>(min_parallelism->value(), parallelism));
    max_parallelism->set_value(std::max<uint64>(max_parallelism->value(), parallelism));
}

void PgDocMetrics::IncrementExecutionTime(master::RelationType relation, bool is_read, uint64_t wait_time) {
    // scoped_refptr<AtomicGauge<uint64_t>> exec_time;

    switch (relation) {
        case master::SYSTEM_TABLE_RELATION:
            is_read ? catalog_reads.exec_time->IncrementBy(wait_time) : catalog_writes.exec_time->IncrementBy(wait_time);
            break;
        case master::USER_TABLE_RELATION:
            is_read ? table_reads.exec_time->IncrementBy(wait_time) : table_writes.exec_time->IncrementBy(wait_time);
            break;
        case master::INDEX_TABLE_RELATION:
            is_read ? index_reads.exec_time->IncrementBy(wait_time) : index_writes.exec_time->IncrementBy(wait_time);
            break;
        default:
            LOG(WARNING) << "Unhandled relation type " << relation;
            return;
    }

    // exec_time->IncrementBy(wait_time);
}

} // pggate
} // yb