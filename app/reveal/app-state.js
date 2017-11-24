const appState = {
  // Configuration defaults, can be overridden at initialization time
  config: {

    // The "normal" size of the presentation, aspect ratio will be preserved
    // when the presentation is scaled to fit different resolutions
    width: 960,
    height: 700,

    // Factor of the display size that should remain empty around the content
    margin: 0.04,

    // Bounds for smallest/largest possible scale to apply to content
    minScale: 0.2,
    maxScale: 2.0,

    // Display presentation control arrows
    controls: true,

    // Help the user learn the controls by providing hints, for example by
    // bouncing the down arrow when they first encounter a vertical slide
    controlsTutorial: true,

    // Determines where controls appear, "edges" or "bottom-right"
    controlsLayout: 'bottom-right',

    // Visibility rule for backwards navigation arrows; "faded", "hidden"
    // or "visible"
    controlsBackArrows: 'faded',

    // Display a presentation progress bar
    progress: true,

    // Display the page number of the current slide
    slideNumber: false,

    // Determine which displays to show the slide number on
    showSlideNumber: 'all',

    // Push each slide change to the browser history
    history: false,

    // Enable keyboard shortcuts for navigation
    keyboard: true,

    // Optional function that blocks keyboard events when retuning false
    keyboardCondition: null,

    // Enable the slide overview mode
    overview: true,

    // Vertical centering of slides
    center: true,

    // Enables touch navigation on devices with touch input
    touch: true,

    // Loop the presentation
    loop: false,

    // Change the presentation direction to be RTL
    rtl: false,

    // Randomizes the order of slides each time the presentation loads
    shuffle: false,

    // Turns fragments on and off globally
    fragments: true,

    // Flags if the presentation is running in an embedded mode,
    // i.e. contained within a limited portion of the screen
    embedded: false,

    // Flags if we should show a help overlay when the question-mark
    // key is pressed
    help: true,

    // Flags if it should be possible to pause the presentation (blackout)
    pause: true,

    // Flags if speaker notes should be visible to all viewers
    showNotes: false,

    // Global override for autolaying embedded media (video/audio/iframe)
    // - null:   Media will only autoplay if data-autoplay is present
    // - true:   All media will autoplay, regardless of individual setting
    // - false:  No media will autoplay, regardless of individual setting
    autoPlayMedia: null,

    // Controls automatic progression to the next slide
    // - 0:      Auto-sliding only happens if the data-autoslide HTML attribute
    //           is present on the current slide or fragment
    // - 1+:     All slides will progress automatically at the given interval
    // - false:  No auto-sliding, even if data-autoslide is present
    autoSlide: 0,

    // Stop auto-sliding after user input
    autoSlideStoppable: true,

    // Use this method for navigation when auto-sliding (defaults to navigateNext)
    autoSlideMethod: null,

    // Enable slide navigation via mouse wheel
    mouseWheel: false,

    // Apply a 3D roll to links on hover
    rollingLinks: false,

    // Hides the address bar on mobile devices
    hideAddressBar: true,

    // Opens links in an iframe preview overlay
    previewLinks: false,

    // Exposes the reveal.js API through window.postMessage
    postMessage: true,

    // Dispatches all reveal.js events to the parent window through postMessage
    postMessageEvents: false,

    // Focuses body when page changes visibility to ensure keyboard shortcuts work
    focusBodyOnPageVisibilityChange: true,

    // Transition style
    transition: 'slide', // none/fade/slide/convex/concave/zoom

    // Transition speed
    transitionSpeed: 'default', // default/fast/slow

    // Transition style for full page slide backgrounds
    backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom

    // Parallax background image
    parallaxBackgroundImage: '', // CSS syntax, e.g. "a.jpg"

    // Parallax background size
    parallaxBackgroundSize: '', // CSS syntax, e.g. "3000px 2000px"

    // Amount of pixels to move the parallax background per slide step
    parallaxBackgroundHorizontal: null,
    parallaxBackgroundVertical: null,

    // The maximum number of pages a single slide can expand onto when printing
    // to PDF, unlimited by default
    pdfMaxPagesPerSlide: Number.POSITIVE_INFINITY,

    // Offset used to reduce the height of content within exported PDF pages.
    // This exists to account for environment differences based on how you
    // print to PDF. CLI printing options, like phantomjs and wkpdf, can end
    // on precisely the total height of the document whereas in-browser
    // printing has to end one pixel before.
    pdfPageHeightOffset: -1,

    // Number of slides away from the current that are visible
    viewDistance: 3,

    // The display mode that will be used to show slides
    display: 'block',

    // Script dependencies to load
    dependencies: []

  },

  // Flags if Reveal.initialize() has been called
  initialized: false,

  // Flags if reveal.js is loaded (has dispatched the 'ready' event)
  loaded: false,

  // Flags if the overview mode is currently active
  overview: false,

  // Holds the dimensions of our overview slides, including margins
  overviewSlideWidth: null,
  overviewSlideHeight: null,

  // The horizontal and vertical index of the currently active slide
  indexh: undefined,
  indexv: undefined,

  // The previous and current slide HTML elements
  previousSlide: undefined,
  currentSlide: undefined,

  previousBackground: undefined,

  // Remember which directions that the user has navigated towards
  hasNavigatedRight: false,
  hasNavigatedDown: false,

  // Slides may hold a data-state attribute which we pick up and apply
  // as a class to the body. This list contains the combined state of
  // all current slides.
  state: [],

  // The current scale of the presentation (see width/height config)
  scale: 1,

  // CSS transform that is currently applied to the slides container,
  // split into two groups
  slidesTransform: { layout: '', overview: '' },

  // Cached references to DOM elements
  dom: {},

  // Features supported by the browser, see #capabilities()
  features: {},

  // Throttles mouse wheel navigation
  lastMouseWheelStep: 0,

  // Delays updates to the URL due to a Chrome thumbnailer bug
  writeURLTimeout: 0,

  // Flags if the interaction event listeners are bound
  eventsAreBound: false,

  // The current auto-slide duration
  autoSlide: 0,

  // Auto slide properties
  autoSlidePlayer: undefined,
  autoSlideTimeout: 0,
  autoSlideStartTime: -1,
  autoSlidePaused: false,

  // Holds information about the currently ongoing touch input
  touch: {
    startX: 0,
    startY: 0,
    startSpan: 0,
    startCount: 0,
    captured: false,
    threshold: 40
  },

  // Holds information about the keyboard shortcuts
  keyboardShortcuts: {
    'N, SPACE': 'Next slide',
    'P': 'Previous slide',
    '&#8592;,  H': 'Navigate left',
    '&#8594;, L': 'Navigate right',
    '&#8593;, K': 'Navigate up',
    '&#8595;, J': 'Navigate down',
    'Home': 'First slide',
    'End': 'Last slide',
    'B, .': 'Pause',
    'F': 'Fullscreen',
    'ESC, O': 'Slide overview'
  }

};

export default appState;
