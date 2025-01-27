// Hydrate when the user types the correct password
export default (load, options) => {
  const password = options.value
  let consecutiveMatch = 0

  const handleKeydown = async (e) => {
    if (e.key === password[consecutiveMatch]) {
      consecutiveMatch++
    } else {
      consecutiveMatch = 0
    }

    if (consecutiveMatch === password.length) {
      window.removeEventListener('keydown', handleKeydown)
      const hydrate = await load()
      await hydrate()
    }
  }
  
  window.addEventListener('keydown', handleKeydown)
}
