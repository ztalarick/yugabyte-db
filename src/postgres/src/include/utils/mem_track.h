#ifndef MEM_TRACK
#define MEM_TRACK

#include "c.h"

// For tracking PG memory for YB
extern Size YbPgCurrentMemory;
extern Size YbTotalMaxMemory;
extern Size YbTotalMaxMemoryPerStmt;

extern void YbPgUpdateMaxMemory();
extern void AddMemoryConsumption(const Size sz);
extern void SubMemoryConsumption(const Size sz);
extern void ResetMemoryConsumptionStmt();

#endif