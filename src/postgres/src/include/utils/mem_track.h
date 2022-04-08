#ifndef MEM_TRACK
#define MEM_TRACK

#include "c.h"

/*
 * Tracking memory consumption for both PG backend and pggate tcmalloc acutal
 * heap consumption.
 * Global accessible in one PG backend process.
 */
typedef struct YbPgMemTracker {
    Size currentMemBytes;
    Size backendMaxMemBytes;
    Size stmtMaxMemBytes;
	Size stmtMaxMemBaseBytes;
} YbPgMemTracker;

extern YbPgMemTracker PgMemTracker;

/*
 * Update current memory usage in MemTracker, when there is no PG
 * memory allocation activities. This is currently supposed to be
 * used by the MemTracker in pggate as a callback.
 */
extern void YbPgMemUpdateMax();

/*
 * Add memory consumption to PgMemTracker in bytes.
 * sz can be negative. In this case, the max values are not
 * updated.
 */
extern void YbPgMemAddConsumption(const Size sz);

/*
 *
 */
extern void YbPgMemSubConsumption(const Size sz);

/*
 * Reset the PgMemTracker's stmt fields and make it ready to
 * track peak memory usage for a new statement.
 */
extern void YbPgMemResetStmtConsumption();

#endif