---
# Taken from https://github.com/endymion1818/deliciousreverie/blob/master/src/pages/post/advanced-custom-fields-bootstrap-tabs.md
categories:
- development
date: "2015-06-02T15:21:21+01:00"
description: I'm not a huge fan of Advanced Custom Fields, but there was a requirement
  to use it in a recent project that had Bootstrap as a basis for the UI. The challenge
  for me was to get Bootstrap `nav-tabs` to play nice with an ACF repeater field.
draft: false
tags:
- wordpress
- advanced custom fields
title: Advanced Custom Fields and Bootstrap Tabs
---

**I'm not a huge fan of Advanced Custom Fields, but there was a requirement to use it in a recent project that had Bootstrap as a basis for the UI. The challenge for me was to get Bootstrap [nav-tabs](http://getbootstrap.com/components/#nav-tabs "Bootstrap nav-tabs component") to play nice with an [ACF repeater field](http://www.advancedcustomfields.com/resources/querying-the-database-for-repeater-sub-field-values/ "Repeater sub-field on Advanced Custom Fields website").**

I started with the basic HTML markup for Bootstrap's Nav Tabs:

```html
<ul class="nav nav-tabs">
  <li role="presentation" class="active"><a href="tabone">TabOne</a></li>
  <li role="presentation"><a href="tabtwo">TabTwo</a></li>
  <li role="presentation"><a href="tabthree">TabThree</a></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="tabone">
     Some content in tab one
</div>
  <div class="tab-pane active" id="tabtwo">
     Some content in tab two
</div>
  <div class="tab-pane active" id="tabthree">
     Some content in tab three
</div>
</div>
```
In the Field Groups settings, I created a Repeater (this is a paid-for add on to the standard Advanced Custom Fields) called "tab Panes", with 2 sub-fields, "Tab Title" and "Tab Contents".

```php
<?php
<!-- Check for parent repeater row -->
<?php if( have_rows('tab_panes') ): ?>
  <ul class="nav nav-tabs" role="tablist">
  <?php // Step 1: Loop through rows, first displaying tab titles in a list
   while( have_rows('tab_panes') ): the_row();
?>
    <li role="presentation" class="active">
      <a
        href="#tabone"
        role="tab"
        data-toggle="tab"
        >
      <?php the_sub_field('tab_title'); ?>
      </a>
    </li>
    <?php endwhile; // end of (have_rows('tab_panes') ):?>
  </ul>
<?php endif; // end of (have_rows('tab_panes') ): ?>
```

The PHP above displays the tabs. The code below, very similarly, displays the tab panes:

```php
<?php if( have_rows('tab_panes') ): ?>
  <div class="tab-content">
  <?php// number rows ?>
  <?php // Step 2: Loop through rows, now displaying tab contents
   while( have_rows('tab_panes') ): the_row();
  // Display each item as a list ?>
      <div class="tab-pane active" id="tabone">
          <?php the_sub_field('tab_contents'); ?>
      </div>
      <?php endwhile; // (have_rows('tab_panes') ):?>
  </div>
<?php endif; // (have_rows('tab_panes') ): ?>
```

By looping through the same repeater, we can get all the tabs out of the database, no problem. But we still have two problems: 1) linking the tab to the pane 2) Assigning the class of "active" so the Javascript is able to add and remove the CSS to reveal / hide the appropriate pane.

### 1) Linking to the Pane

There are a number of ways to do this. I could ask the user to input a number to uniquely identify the tab pane. But that would add extra work to the users flow, and they might easily find themselves out of their depth. I want to make this as easy as possible for the user.

On the other hand, WordPress has a very useful function called Sanitize HTML, which we input the value of the title, take out spaces and capitals, and use this as the link:

```php
<a href="#<?php echo sanitize_html_class( the_sub_field( 'tab_title' ) ); ?>"
```

### 2) Assigning the 'Active' Class

So now we need to get a class of 'active' _only on_ the first tab. The Bootstrap Javascript will do the rest for us. How do we do that?

I added this code just inside the `while` loop, inside the `ul` tag:

```php
<?php $row = 1; // number rows ?>
```

This php is a counter. So we can identify the first instance and assign an `if` statement to it.

```php
<a class="<?php if($row == 1) {echo 'active';}?>">
```

The final thing to do, is to keep the counter running, but adding this just before the `endwhile`.

```php
<?php $row++; endwhile; // (have_rows('tab_panes') ):?>
```

Once you've added these to the tab panes in a similar way, you'll be up and running with Bootstrap Tabs.

Below is a GitHub Gist, with the complete code for reference. [Link to this (if you can't see the iFrame)](https://gist.github.com/endymion1818/478d86025f41c8060888 "GitHub GIST for Advanced Custom Fields bootstrap tabs").

<script src="https://gist.github.com/endymion1818/478d86025f41c8060888.js"></script>
