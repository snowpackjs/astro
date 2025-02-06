// This module is only used by the prerendered 500.astro.
// It exhibits different behavior if it's called more than once,
// which is detected by a test and interpreted as a failure.

let usedOnce = false
let dynamicMessage = "Page was not prerendered"

export default function () {
    if (usedOnce === false) {
        usedOnce = true
        return "Something went wrong"
    }
    
    dynamicMessage += "+"
    
    return dynamicMessage
}
