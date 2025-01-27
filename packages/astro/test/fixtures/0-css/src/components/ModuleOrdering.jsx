import { module_ordering } from './ModuleOrdering.module.css';

export default function Counter() {
  return (
    <p className={`module-ordering ${module_ordering}`}>This should be green</p>
  )
}
