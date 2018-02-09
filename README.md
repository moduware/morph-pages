# morph-pages
Pages element for polymorph components that morphs for current mobile OS.

## Getting Started:
For the information about how to clone the desired repository, running the local server and testing, please refer to this [link](https://github.com/moduware/polymorph-components/blob/master/INFO.md).

## Demo

// TODO: Add quick demo of the morph-pages with gif or screen shot

- Here is a quick demo of `<morph-pages>`

  <p>On IOS platform;</p>

<p align="center">
  <img src="demo-images/morph-pages-ios-demo.gif" alt="Morph Pages element" />

  <p>On Android platform;</p>

<p align="center">
  <img src="demo-images/morph-pages-android-demo.gif" alt="Morph Pages element" />

## Styling

  // TODO: Find all custom CSS for morph-pages and put it here with description
  -For Android platform;

  Custom property                  | Description                            | Default
  ---------------------------------|----------------------------------------|--------------------
  `--morph-pages-example`          | Width of the app pages                 | 260px
  `--another-example-android`      | Background color for android           | rgba(0, 0, 0, 0.2)
  `--and-another-one`              | Morph-pages background color           | var(--morph-pages-background-android)

  -For IOS platform;

  Custom property                  | Description                            | Default
  ---------------------------------|----------------------------------------|--------------------
  `--morph-pages-example`          | Width of the app pages                 | 260px
  `--morph-pages-ios-example`      | Background color for ios               | rgba(0, 0, 0, 0)
  `--page-ios-background`          | Morphp-pages background color          | var(--morph-pages-background-ios)

## Attributes

  | Custom Attribute |   Type  | Description                                                                                                                      | Default     |
  |:----------------:|:-------:|----------------------------------------------------------------------------------------------------------------------------------|-------------|
  |  **`animationInProgress`**  | Boolean  | Indicates if there are animation in progess.| **`left`**  |
  |    **`threshold`**   | Number | The value used to decide if a transition is effective and therefore if the page get swiped | **`cubic-bezier(0.4, 0.0, 0.2, 1)`**      |
  |  **`transitionTimingFunction`**  | String  | The CSS transition timing function applied | **`400`**  |
  |    **`navigationHistory`**   | Array | Array of previous pages location hash or value | **`() => []`**  |  
  |    **`pageChangeAnimationDirection`**   | String | Page animation direction setter that links with morph-location's last-navigation-direction | **`forward`**  |   

## How to use our **`<morph-pages>`** component

// TODO: Add description on how to use morph-pages. Sample markup


