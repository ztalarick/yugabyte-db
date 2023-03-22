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

METRIC_DEFINE_counter(
    pg_doc_request, docdb_lifetime_table_reads, "Number of DocDB table reads in the lifetime",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_lifetime_table_writes, "Number of DocDB table writes in the lifetime",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_req_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_min_parallelism, "Minimum number of requests batched to DocDB",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_gauge_uint64(
    pg_doc_request, docdb_max_parallelism, "Maximum number of requests batched to DocDB",
    yb::MetricUnit::kRequests, "Desc goes here");

namespace yb {
namespace pggate {

PgDocMetrics::PgDocMetrics(MetricRegistry* registry, const std::string& id) {
    entity_ = METRIC_ENTITY_pg_doc_request.Instantiate(registry, id);
    
    // User table metrics
    table_reads = entity_->FindOrCreateCounter(&METRIC_docdb_table_reads);
    table_writes = entity_->FindOrCreateCounter(&METRIC_docdb_index_reads);

    // Secondary index metrics
    index_reads = entity_->FindOrCreateCounter(&METRIC_docdb_table_writes);
    index_writes = entity_->FindOrCreateCounter(&METRIC_docdb_index_writes);

    // Catalog metrics
    catalog_reads = entity_->FindOrCreateCounter(&METRIC_docdb_catalog_reads);
    catalog_writes = entity_->FindOrCreateCounter(&METRIC_docdb_catalog_writes);

    min_parallelism = entity_->FindOrCreateGauge(&METRIC_docdb_min_parallelism, static_cast<uint64>(1));
    max_parallelism = entity_->FindOrCreateGauge(&METRIC_docdb_max_parallelism, static_cast<uint64>(1));

    // counter_lifetime_reads = metric_entity_->FindOrCreateCounter(&METRIC_docdb_lifetime_table_reads);
    // counter_lifetime_writes = metric_entity_->FindOrCreateCounter(&METRIC_docdb_lifetime_table_writes);
}

PgDocMetrics::~PgDocMetrics() = default;

void PgDocMetrics::Reset() {
    LOG(INFO) << Format("Stats: UT($0, $1), IND($2, $3), CAT($4, $5)", 
        table_reads->value(), table_writes->value(),
        index_reads->value(), index_writes->value(),
        catalog_reads->value(), catalog_writes->value()
    );

    // User table metrics
    table_reads->ResetValue();
    table_writes->ResetValue();

    // Secondary index metrics
    index_reads->ResetValue();
    index_writes->ResetValue();

    // Catalog metrics
    catalog_reads->ResetValue();
    catalog_writes->ResetValue();

    min_parallelism->set_value(1);
    max_parallelism->set_value(1);
}

uint64_t PgDocMetrics::GetNumTableReadRequests() {
    return table_reads->value();
}

uint64_t PgDocMetrics::GetNumTableWriteRequests() {
    return table_writes->value();
}

void PgDocMetrics::GetStats(YBCPgExecStats *stats) {
    stats->num_table_reads = GetNumTableReadRequests();
    stats->num_table_writes = GetNumTableWriteRequests();

    stats->num_index_reads = index_reads->value();
    stats->num_index_writes = index_writes->value();

    stats->num_catalog_reads = catalog_reads->value();
    stats->num_catalog_writes = catalog_writes->value();

    stats->min_parallelism = min_parallelism->value();
    stats->max_parallelism = max_parallelism->value();
}

void PgDocMetrics::AddDocOpRequest(master::RelationType relation, bool is_read, uint64_t parallelism) {
    // master::RelationType rtype = relation.has_value() ? relation.value() : master::SYSTEM_TABLE_RELATION;

    switch (relation) {
        case master::SYSTEM_TABLE_RELATION:
            is_read ? catalog_reads->IncrementBy(parallelism) : catalog_writes->IncrementBy(parallelism);
            break;
        case master::USER_TABLE_RELATION:
            is_read ? table_reads->IncrementBy(parallelism) : table_writes->IncrementBy(parallelism);
            break;
        case master::INDEX_TABLE_RELATION:
            is_read ? index_reads->IncrementBy(parallelism) : index_writes->IncrementBy(parallelism);
            break;
        default:
            LOG(WARNING) << "Unhandled relation type " << relation;
    }

    min_parallelism->set_value(std::min<uint64>(min_parallelism->value(), parallelism));
    max_parallelism->set_value(std::max<uint64>(max_parallelism->value(), parallelism));
}

} // pggate
} // yb