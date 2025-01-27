import { useState } from "react"

export const ListExportTestComponent = () => {
  const [example] = useState('Example')
  return <h2 id="list_export_test_component">{example}</h2>
}
