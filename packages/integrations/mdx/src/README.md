# Internal documentation

## rehype-optimize-static

The `rehype-optimize-static` plugin helps optimize the intermediate [`hast`](https://github.com/syntax-tree/hast) when processing MDX, collapsing static subtrees of the `hast` as a `"static string"` in the final JSX output. Here's a "before" and "after" result:

Before:

```jsx
function _createMdxContent() {
  return (
    <>
      <h1>My MDX Content</h1>
      <pre>
        <code class="language-js">
          <span class="token function">console</span>
          <span class="token punctuation">.</span>
          <span class="token function">log</span>
          <span class="token punctuation">(</span>
          <span class="token string">'hello world'</span>
          <span class="token punctuation">)</span>
        </code>
      </pre>
    </>
  );
}
```

After:

```jsx
function _createMdxContent() {
  return <Fragment set:html="<h1>My MDX Content</h1>\n<code class=...</code>" />;
}
```

> NOTE: If one of the nodes in `pre` is MDX, the optimization will not be applied to `pre`, but could be applied to the inner MDX node if its children are static.

This results in fewer JSX nodes, less compiled JS output, and less parsed AST, which results in faster Rollup builds and runtime rendering.

To achieve this, we use an algorithm to detect `hast` subtrees that are entirely static (containing no JSX) to be inlined as `set:html` to the root of the subtree.

The next section explains the algorithm, which you can follow along by pairing with the [source code](./rehype-optimize-static.ts). To analyze the `hast`, you can paste the MDX code into https://mdxjs.com/playground.

### How it works

The flow can be divided into a "scan phase" and a "mutation phase". The scan phase searches for nodes that can be optimized, and the mutation phase applies the optimization on the `hast` nodes.

#### Scan phase

Variables:

- `allPossibleElements`: A set of subtree roots where we can add a new `set:html` property with its children as value.
- `elementStack`: The stack of elements (that could be subtree roots) while traversing the `hast` (node ancestors).
- `elementMetadatas`: A weak map to store the metadata used only by the mutation phase later.

Flow:

1. Walk the `hast` tree.
2. For each `node` we enter, if the `node` is static (`type` is `element` or starts with `mdx`), record in `allPossibleElements` and push to `elementStack`. We also record additional metadata in `elementMetadatas` for the mutation phase later.
   - Q: Why do we record `mdxJsxFlowElement`, it's MDX? <br>
     A: Because we're looking for nodes whose children are static. The node itself doesn't need to be static.
   - Q: Are we sure this is the subtree root node in `allPossibleElements`? <br>
     A: No, but we'll clear that up later in step 3.
3. For each `node` we leave, pop from `elementStack`. If the `node`'s parent is in `allPossibleElements`, we also remove the `node` from `allPossibleElements`.
   - Q: Why do we check for the node's parent? <br>
     A: Checking for the node's parent allows us to identify a subtree root. When we enter a subtree like `C -> D -> E`, we leave in reverse: `E -> D -> C`. When we leave `E`, we see that it's parent `D` exists, so we remove `E`. When we leave `D`, we see `C` exists, so we remove `D`. When we leave `C`, we see that its parent doesn't exist, so we keep `C`, a subtree root.
4. _(Returning to the code written for step 2's `node` enter handling)_ We also need to handle the case where we find non-static elements. If found, we remove all the elements in `elementStack` from `allPossibleElements`. This happens before the code in step 2.
   - Q: Why? <br>
     A: Because if the `node` isn't static, that means all its ancestors (`elementStack`) have non-static children. So, the ancestors couldn't be a subtree root to be optimized anymore.
   - Q: Why before step 2's `node` enter handling? <br>
     A: If we find a non-static `node`, the `node` should still be considered in `allPossibleElements` as its children could be static.
5. Walk done. This leaves us with `allPossibleElements` containing only subtree roots that can be optimized.
6. Proceed to the mutation phase.

#### Mutation phase

Inputs:

- `allPossibleElements` from the scan phase.
- `elementMetadatas` from the scan phase.

Flow:

1. Before we mutate the `hast` tree, each element in `allPossibleElements` may have siblings that can be optimized together. Sibling elements are grouped with the `findElementGroups()` function, which returns an array of element groups (new variable `elementGroups`) and mutates `allPossibleElements` to remove elements that are already part of a group.

   - Q: How does `findElementGroups()` work? <br>
     A: For each elements in `allPossibleElements` that are non-static, we're able to take the element metadata from `elementMetadatas` and guess the next sibling node. If the next sibling node is static and is an element in `allPossibleElements`, we group them together for optimization. It continues to guess until it hits a non-static node or an element not in `allPossibleElements`, which it'll finalize the group as part of the returned result.

2. For each elements in `allPossibleElements`, we serialize them as HTML and add it to the `set:html` property of the `hast` node, and remove its children.
3. For each element group in `elementGroups`, we serialize the group children as HTML and add it to a new `<Fragment set:html="..." />` node, and replace the group children with the new `<Fragment />` node.
4. 🎉 The rest of the MDX pipeline will do its thing and generate the desired JSX like above.

### Extra

#### MDX custom components

Astro's MDX implementation supports specifying `export const components` in the MDX file to render some HTML elements as Astro components or framework components. `rehype-optimize-static` also needs to parse this JS to recognize some elements as non-static.

#### Further optimizations

In [Scan phase](#scan-phase) step 4,

> we remove all the elements in `elementStack` from `allPossibleElements`

We can further optimize this by then also emptying the `elementStack`. This ensures that if we run this same flow for a deeper node in the tree, we don't remove the already-removed nodes from `allPossibleElements`.

While this breaks the concept of `elementStack`, it doesn't matter as the `elementStack` array pop in the "leave" handler (in step 3) would become a no-op.

Example `elementStack` value during walking phase:

```
Enter: A
Enter: A, B
Enter: A, B, C
(Non-static node found): <empty>
Enter: D
Enter: D, E
Leave: D
Leave: <empty>
Leave: <empty>
Leave: <empty>
Leave: <empty>
```
