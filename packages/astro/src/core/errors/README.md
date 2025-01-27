# Errors

> Interested in the technical details? See the comments in [errors-data.ts.](./errors-data.ts)

## Writing error messages for Astro

### Tips

**Error Format**

Name:

- This property is a static reference to the error. The shape should be similar to JavaScript's native errors (TypeError, ReferenceError): pascal-cased, no spaces, no special characters etc. (ex: `ClientAddressNotAvailable`)
- This is the only part of the error message that should not be written as a full, proper sentence complete with Capitalization and end punctuation.

Title:

- Use this property to briefly describe the error in a few words. This is the user's way to see at a glance what has happened and will be prominently displayed in the UI (ex: `{feature} is not available in static mode.`) Do not include further details such as why this error occurred or possible solutions.

Message:

- Begin with **what happened** and **why**. (ex: `Could not use {feature} because Server-side Rendering is not enabled.`)
- Then, **describe the action the user should take**. (ex: `Update your Astro config with `output: 'server'` to enable Server-side Rendering.`)
- Although this does not need to be as brief as the `title`, try to keep sentences short, clear and direct to give the reader all the necessary information quickly as possible. Users should be able to skim the message and understand the problem and solution.
- If your message is too long, or the solution is not guaranteed to work, use the `hint` property to provide more information.

Hint:

- A `hint` can be used for any additional info that might help the user. (ex: a link to the documentation, or a common cause)

**Writing Style**

- Write in proper sentences. Include periods at the end of sentences. Avoid using exclamation marks! (Leave them to Houston!)
- Technical jargon is mostly okay! But, most abbreviations should be avoided. If a developer is unfamiliar with a technical term, spelling it out in full allows them to look it up on the web more easily.
- Describe the _what_, _why_ and _action to take_ from the user's perspective. Assume they don't know Astro internals, and care only about how Astro is _used_. (ex: `You are missing...` vs `Astro/file cannot find...`)
- Avoid using cutesy language. (ex: Oops!) This tone minimizes the significance of the error, which _is_ important to the developer. The developer may be frustrated and your error message shouldn't be making jokes about their struggles. Only include words and phrases that help the developer **interpret the error** and **fix the problem**.

If you are unsure about anything, ask [Erika](https://github.com/Princesseuh)!

### CLI specifics tips:

- If the error happened **during an action that changes the state of the project** (ex: editing configuration, creating files), the error should **reassure the user** about the state of their project (ex: "Failed to update configuration. Your project has been restored to its previous state.")
- If an "error" happened because of a conscious user action (ex: pressing CTRL+C during a choice), it is okay to add more personality (ex: "Operation cancelled. See you later, astronaut!"). Do keep in mind the previous point however (ex: "Operation cancelled. No worries, your project folder has already been created")

### Shape

- **Names are permanent**, and should never be changed. Users should always be able to find an error by searching, and this ensures a matching result.
- Contextual information may be used to enhance the message or the hint. However, the code that caused the error or the position of the error should not be included in the message as they will already be shown as part of the error.
- Do not prefix `title`, `message` and `hint` with descriptive words such as "Error:" or "Hint:" as it may lead to duplicated labels in the UI / CLI.
- Dynamic error messages **must** use the following shape:

```js
message: (arguments) => `text ${substitute}`;
```

Please avoid including too much logic inside the errors if you can. The last thing you want is for a bug to happen inside what's already an error!

If the different arguments needs processing before being shown (ex: `toString`, `JSON.stringify`), the processing should happen where the error is thrown and not inside the message itself.

Using light logic to add / remove different parts of the message is okay, however make sure to include a `@message` tag in the JSDoc comment for the auto-generated documentation. See below for more information.

### Documentation support through JSDoc

Using JSDoc comments, [a reference for every error message](https://docs.astro.build/en/reference/error-reference/) is built automatically on our docs.

Here's how to create and format the comments:

```js
/**
 * @docs <- Needed for the comment to be used for docs
 * @message <- (Optional) Clearer error message to show in cases where the original one is too complex (ex: because of conditional messages)
 * @see <- (Optional) List of additional references users can look at
 * @description <- Description of the error
 * @deprecated <- (Optional) If the error is no longer relevant, when it was removed and why (see "Removing errors" section below)
 */
```

Example:

```js
/**
 * @docs
 * @message Route returned a `returnedValue`. Only a Response can be returned from Astro files.
 * @see
 * - [Response](https://docs.astro.build/en/guides/server-side-rendering/#response)
 * @description
 * Only instances of [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned inside Astro files.
 */
```

The `@message` property is intended to provide slightly more context when it is helpful: a more descriptive error message or a collection of common messages if there are multiple possible error messages. Try to avoid making substantial changes to existing messages so that they are easy to find for users who copy and search the exact content of an error message.

### Removing errors

If the error cannot be triggered at all anymore, it can deprecated by adding a `@deprecated` tag to the JSDoc comment with a message that will be shown in the docs. This message is useful for users on previous versions who might still encounter the error so that they can know that upgrading to a newer version of Astro would perhaps solve their issue.

```js
/**
 * @docs
 * @deprecated Removed in Astro v9.8.6 as it is no longer relevant due to...
 */
```

Alternatively, if no special deprecation message is needed, errors can be directly removed from the `errors-data.ts` file. A basic message will be shown in the docs stating that the error can no longer appear in the latest version of Astro.

### Always remember

Error are a reactive strategy. They are the last line of defense against a mistake.

While adding a new error message, ask yourself, "Was there a way this situation could've been avoided in the first place?" (docs, editor tooling etc).

**If you can prevent the error, you don't need an error message!**

## Additional resources on writing good error messages

- [Compiler errors for humans](https://elm-lang.org/news/compiler-errors-for-humans)
- [When life gives you lemons, write better error messages](https://wix-ux.com/when-life-gives-you-lemons-write-better-error-messages-46c5223e1a2f)
- [RustConf 2020 - Bending the Curve: A Personal Tutor at Your Fingertips by Esteban Kuber](https://www.youtube.com/watch?v=Z6X7Ada0ugE)
- [What's in a good error](https://erika.florist/articles/gooderrors) (by the person who wrote this document!)
