import node from '@astrojs/node'

export default {
    base: '/some-base',
    output: 'static',
    trailingSlash: 'never',
    adapter: node({ mode: 'standalone' })
};
