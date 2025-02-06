import { Dynamic } from 'solid-js/web'

const BaseComponent = ({ tag } = {}) => {
  return <Dynamic id="proxy-component" component={tag || 'div'}>Hello world</Dynamic>;
}

// Motion uses a Proxy to support syntax like `<Motion.div />` and `<Motion.button />` etc
// https://cdn.jsdelivr.net/npm/@motionone/solid@10.14.2/dist/source/motion.jsx
const ProxyComponent = new Proxy(BaseComponent, {
  get: (_, tag) => (props) => {
    delete props.tag
    return <BaseComponent {...props} tag={tag} />;
  }
})

export default ProxyComponent;
