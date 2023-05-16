/*-------------------------------------------------------------------------
 *
 * pg_yb_query_tracing.h
 *	  definition of the "query tracing" system catalog (pg_yb_query_tracing)
 *
 * Copyright (c) Yugabyte, Inc.
 *
 * src/include/catalog/yb_query_tracing.h
 *
 * NOTES
 *	  The Catalog.pm module reads this file and derives schema
 *	  information.
 *
 *-------------------------------------------------------------------------
 */
#ifndef PG_YB_QUERY_TRACING_H
#define PG_YB_QUERY_TRACING_H

#include "catalog/genbki.h"
#include "catalog/pg_yb_query_tracing_d.h"

/* ----------------
 *		pg_yb_query_tracing definition.  cpp turns this into
 *		typedef struct pg_yb_query_tracing
 * ----------------
 */
CATALOG(pg_yb_query_tracing,8062,YbTracingRelationId)
{
	int64		query_id;		/* Query Id of the query for which 
                                 * tracing is enabled */
	int64		timestamp;		/* Time when query tracing was
                                 * was enabled */
} FormData_pg_yb_query_tracing;

/* ----------------
 *		Form_pg_yb_query_tracing corresponds to a pointer to a tuple with
 *		the format of pg_yb_query_tracing relation.
 * ----------------
 */
typedef FormData_pg_yb_query_tracing *Form_pg_yb_query_tracing;

#endif							/* PG_YB_QUERY_TRACING_H */
