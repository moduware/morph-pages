# morph-pages
Pages element for polymorph components that morphs for current mobile OS.

## Getting Started:
For the information about how to clone the desired repository, running the local server and testing, please refer to this [link](https://github.com/moduware/polymorph-components/blob/master/INFO.md).

## Demo

- Here is a quick demo of `<morph-pages>`

  <p>On IOS platform:</p>

  <p align="center">
    <img src="demo-images/morph-pages-ios-demo.gif" alt="Morph Pages element" />
  </p>

  <p>On Android platform:</p>

  <p align="center">
    <img src="demo-images/morph-pages-android-demo.gif" alt="Morph Pages element" />
  </p>

  <p>SWIPEBACK On IOS platform:</p>

  <p align="center">
    <img src="demo-images/morph-pages-ios-swipeback-demo.gif" alt="Morph Pages element" />
  </p>
## Attributes

  | Custom Attribute |   Type  | Description                                                                                                                      | Default     |
  |:----------------:|:-------:|----------------------------------------------------------------------------------------------------------------------------------|-------------|
  |  **`animationInProgress`**  | Boolean  | Indicates if there are animation in progess.| **no default**  |
  |    **`threshold`**   | Number | The value used to decide if a transition is effective and therefore if the page get swiped | **`cubic-bezier(0.4, 0.0, 0.2, 1)`**      |
  |  **`transitionTimingFunction`**  | String  | The CSS transition timing function applied | **`400`**  |
  |    **`navigationHistory`**   | Array | Array of previous pages location hash or value | **`() => []`**  |
  |    **`pageChangeAnimationDirection`**   | String | Page animation direction setter that links with morph-location's last-navigation-direction | **`forward`**  |
  |    **`noAnimation`**   | Boolean | Sets Page animation on html markup so no animation when set to **'true'** | **`false`**  |

## Styling

Custom property                  | Description                               | Default
---------------------------------|-------------------------------------------|--------------------
`--host-page-display`            | Display property of the morph pages       | `block`
`--host-slotted-page-diplay`     | Display property of morph pages children  | `block`

## How to use our **`<morph-pages>`** component

- `morph-pages` is used to select one of its children to show just like iron-pages. One use is to cycle through a list of its 'pages' or 'children'.

```html
  <morph-pages selected="0">
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
  </morph-pages>

  <script>
    document.addEventListener('click', function(e) {
      var pages = document.querySelector('morph-pages');
      pages.selectNext();
    });
  </script>
```

- Example html markup for morph-pages using app-toolbar and morph-location

```html

    <app-toolbar class="header-container">
      <paper-icon-button icon="arrow-back" onclick="previousPage()"></paper-icon-button>
      <div main-title>morph-pages</div>
    </app-toolbar>
    <div class="links">
      <a href="#one">One</a>
      <a href="#two">Two</a>
      <a href="#three">Three</a>
      <a href="#four">Four</a>
      <a href="#five">Five</a>
      <a href="#six">Six</a>
    </div>
    <div class="container">
      <morph-location hash="{{currentPage}}" last-navigation-direction="{{direction}}" dwell-time="0"></morph-location>
      <morph-pages selected="{{currentPage}}" page-change-animation-direction="[[direction]]" attr-for-selected="name" platform="ios" fallback-selection="one">
        <div name="one" class="page background-green"><h1>One</h1></div>
        <div name="two" class="page background-white"><h1>Two</h1></div>
        <div name="three" class="page background-green"><h1>Three</h1></div>
        <div name="four" class="page background-white"><h1>Four</h1></div>
        <div name="five" class="page background-green"><h1>Five</h1></div>
        <div name="six" class="page background-white"><h1>Six</h1></div>
      </morph-pages>
    </div>

    <script>
      /**
      * move to previous page
      */
      previousPage = function() {
        history.back();
      };

    </script>

```

- morph-pages inherited from iron-pages and is backwards compatible. For more detailed documentation on how to use iron-pages go [here](https://www.webcomponents.org/element/PolymerElements/iron-pages/elements/iron-pages).
