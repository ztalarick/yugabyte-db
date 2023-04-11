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

#include <string>
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
    pg_doc_request, docdb_catalog_reads, "Number of system catalog reads",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_catalog_writes, "Number of system catalog writes",
    yb::MetricUnit::kRequests, "Desc goes here");
METRIC_DEFINE_counter(
    pg_doc_request, docdb_flushes, "Number of flushes", yb::MetricUnit::kRequests,
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
    pg_doc_request, docdb_flush_wait, "Time (in unit: X) waited to complete DocDB request",
    yb::MetricUnit::kMicroseconds, "Desc goes here");

namespace yb {
namespace pggate {

using master::RelationType;

RpcStats::RpcStats() {}

RpcStats::RpcStats(
    scoped_refptr<MetricEntity> entity, CounterPrototype *count_proto,
    GaugePrototype<uint64_t> *exec_time_proto) {

    count = entity->FindOrCreateCounter(count_proto);
    exec_time = entity->FindOrCreateGauge(exec_time_proto, static_cast<uint64>(0L));
}

void RpcStats::Reset() const {
    count->ResetValue();
    exec_time->set_value(0);
}

void RpcStats::IncrementCountBy(uint64_t num) const {
    count->IncrementBy(num);
}

PgDocMetrics::PgDocMetrics(MetricRegistry* registry, const std::string& id) {
    entity_ = METRIC_ENTITY_pg_doc_request.Instantiate(registry, id);

    // User table metrics
    table_reads = RpcStats(
        entity_, &METRIC_docdb_table_reads, &METRIC_docdb_table_read_wait);
    table_writes = RpcStats(
        entity_, &METRIC_docdb_table_writes, &METRIC_docdb_table_write_wait);

    // Secondary index metrics
    index_reads = RpcStats(
        entity_, &METRIC_docdb_index_reads, &METRIC_docdb_index_read_wait);
    index_writes = RpcStats(
        entity_, &METRIC_docdb_index_writes, &METRIC_docdb_index_write_wait);

    // Catalog metrics
    catalog_reads = RpcStats(
        entity_, &METRIC_docdb_catalog_reads, &METRIC_docdb_catalog_read_wait);
    catalog_writes = RpcStats(
        entity_, &METRIC_docdb_catalog_writes, &METRIC_docdb_catalog_write_wait);

    // Flushes metrics
    flushes = RpcStats(
        entity_, &METRIC_docdb_flushes, &METRIC_docdb_flush_wait);
}

PgDocMetrics::~PgDocMetrics() = default;

void PgDocMetrics::Reset() {
    // User table metrics
    table_reads.Reset();
    table_writes.Reset();

    // Secondary index metrics
    index_reads.Reset();
    index_writes.Reset();

    // Catalog metrics
    catalog_reads.Reset();
    catalog_writes.Reset();
}

void PgDocMetrics::FillStats(YBCPgExecStats *stats) const {
    // User table metrics
    stats->num_table_reads = table_reads.count->value();
    stats->table_read_wait = table_reads.exec_time->value();
    stats->num_table_writes = table_writes.count->value();

    // Secondary Index metrics
    stats->num_index_reads = index_reads.count->value();
    stats->index_read_wait = index_reads.exec_time->value();
    stats->num_index_writes = index_writes.count->value();

    // Catalog metrics
    stats->num_catalog_reads = catalog_reads.count->value();
    stats->catalog_read_wait = catalog_reads.exec_time->value();
    stats->num_catalog_writes = catalog_writes.count->value();
    stats->catalog_write_wait = catalog_writes.exec_time->value();

    // Flush metrics
    stats->num_flushes = flushes.count->value();
    stats->flush_wait = flushes.exec_time->value();
}

void PgDocMetrics::AddDocOpRequest(
    RelationType relation, bool is_read, uint64_t parallelism) {

    Counter *metric;

    switch (relation) {
        case master::SYSTEM_TABLE_RELATION:
            metric = is_read ? catalog_reads.count.get() : catalog_writes.count.get();
            break;
        case master::USER_TABLE_RELATION:
            metric = is_read ? table_reads.count.get() : table_writes.count.get();
            break;
        case master::INDEX_TABLE_RELATION:
            metric = is_read ? index_reads.count.get() : index_writes.count.get();
            break;
        default:
            LOG(WARNING) << "Skipping metric collection for unhandled relation type " << relation;
            return;
    }

    metric->IncrementBy(1);
}

void PgDocMetrics::IncrementExecutionTime(
    RelationType relation, bool is_read, uint64_t wait_time) {

    AtomicGauge<uint64_t> *metric;
    switch (relation) {
        case master::SYSTEM_TABLE_RELATION:
            metric = is_read ? catalog_reads.exec_time.get() : catalog_writes.exec_time.get();
            break;
        case master::USER_TABLE_RELATION:
            metric = is_read ? table_reads.exec_time.get() : table_writes.exec_time.get();
            break;
        case master::INDEX_TABLE_RELATION:
            metric =  is_read ? index_reads.exec_time.get() : index_writes.exec_time.get();
            break;
        default:
            LOG(WARNING) << "Skipping metric collection for unhandled relation type " << relation;
            return;
    }

    metric->IncrementBy(wait_time);
}

void PgDocMetrics::AddFlushRequest(uint64_t wait_time) const {
    flushes.IncrementCountBy(1);
    flushes.exec_time->IncrementBy(wait_time);
}

} // namespace pggate
} // namespace yb
