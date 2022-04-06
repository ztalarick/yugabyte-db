#ifndef MEM_TRACK
#define MEM_TRACK

#include "c.h"

// For tracking PG memory for YB
extern Size YbPgMaxMemory;
extern Size YbPgMaxMemoryPerStmt;

extern void AddMemoryConsumption(const Size sz);

extern void SubMemoryConsumption(const Size sz);

extern void ResetMemoryConsumptionStmt(const Size sz);

#endif