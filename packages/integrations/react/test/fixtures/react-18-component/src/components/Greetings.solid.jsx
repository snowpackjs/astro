// Render a solid component to ensure multi-framework setups work when framework type cannot
// be derived from extension alone.
export default function ({ name }) {
  return <h2 id={`solid-${name}`}>Greetings {name}!</h2>;
}
