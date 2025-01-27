import { useState } from "react"

function withSomething(Component) {
    return (props) => {
        const [example] = useState('Example')
        return <Component {...props} example={example} />;
    };
}

function Child({ example }) {
    return <h2 id="hoc_default_export">{example}</h2>
}

export default withSomething(Child)
