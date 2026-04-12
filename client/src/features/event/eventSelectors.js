export const selectEventState = (state) => state.event
export const selectAllEvents = (state) => selectEventState(state).events
export const selectActiveEvent = (state) => selectEventState(state).activeEvent
