import type { Alpine } from 'alpinejs'

export default (Alpine: Alpine) => {
    Alpine.directive('foo', el => {
        el.textContent = 'bar';
    })
}