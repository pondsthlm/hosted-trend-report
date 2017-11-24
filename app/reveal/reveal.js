/* global head */

import capabilities from './capabilities.js';
import appState from './app-state.js';

const reveal = function () {

  let Reveal;

  // The reveal.js version
  const VERSION = '3.6.0';

  const SLIDES_SELECTOR = '.slides section';
  const HORIZONTAL_SLIDES_SELECTOR = '.slides>section';
  const VERTICAL_SLIDES_SELECTOR = '.slides>section.present>section';
  const HOME_SLIDE_SELECTOR = '.slides>section:first-of-type';
  const UA = navigator.userAgent;


  /**
  * Starts up the presentation if the client is capable.
  */
  function initialize(options) {

    // Make sure we only initialize once
    if (appState.initialized === true) return;

    appState.initialized = true;

    appState.features = Object.assign({}, appState.features, capabilities(UA));

    if (!appState.features.transforms2d && !appState.features.transforms3d) {
      document.body.setAttribute('class', 'no-transforms');

      // Since JS won't be running any further, we load all lazy
      // loading elements upfront
      const images = toArray(document.getElementsByTagName('img'));
      const iframes = toArray(document.getElementsByTagName('iframe'));

      const lazyLoadable = images.concat(iframes);

      [].forEach.call(lazyLoadable, (element) => {
        if (element.getAttribute('data-src')) {
          element.setAttribute('src', element.getAttribute('data-src'));
          element.removeAttribute('data-src');
        }
      });

      // If the browser doesn't support core features we won't be
      // using JavaScript to control the presentation
      return;
    }

    // Cache references to key DOM elements
    appState.dom.wrapper = document.querySelector('.reveal');

    appState.dom.slides = document.querySelector('.reveal .slides');

    // Force a layout when the whole page, incl fonts, has loaded
    window.addEventListener('load', layout, false);

    const query = Reveal.getQueryHash();

    // Do not accept new dependencies via query appState.config to avoid
    // the potential of malicious script injection
    if (typeof query.dependencies !== 'undefined' ) delete query.dependencies;

    // Copy options over to our appState.config object
    appState.config = Object.assign({}, appState.config, options, query);

    // Hide the address bar in mobile browsers
    hideAddressBar();

    // Loads the dependencies and continues to #start() once done
    load();

  }

  /**
  * Loads the dependencies of reveal.js. Dependencies are
  * defined via the appState.configuration option 'dependencies'
  * and will be loaded prior to starting/binding reveal.js.
  * Some dependencies may have an 'async' flag, if so they
  * will load after reveal.js has been started up.
  */
  function load() {

    const scripts = [];
    const scriptsAsync = [];
    let scriptsToPreload = 0;

    // Called once synchronous scripts finish loading
    function proceed() {
      if (scriptsAsync.length) {
        // Load asynchronous scripts
        head.js.apply(null, scriptsAsync);
      }

      start();
    }

    function loadScript(s) {
      head.ready(s.src.match(/([\w\d_-]*)\.?js$|[^\\/]*$/i )[0], () => {
        // Extension may contain callback functions
        if (typeof s.callback === 'function') {
          s.callback.apply(this);
        }

        if (--scriptsToPreload === 0) {
          proceed();
        }
      });
    }

    for (let i = 0, len = appState.config.dependencies.length; i < len; i++) {
      const s = appState.config.dependencies[i];

      // Load if there's no condition or the condition is truthy
      if (!s.condition || s.condition()) {
        if (s.async) {
          scriptsAsync.push(s.src);
        } else {
          scripts.push(s.src);
        }

        loadScript(s);
      }
    }

    if (scripts.length) {
      scriptsToPreload = scripts.length;

      // Load synchronous scripts
      head.js.apply(null, scripts);
    } else {
      proceed();
    }

  }

  /**
  * Starts up reveal.js by binding input events and navigating
  * to the current URL deeplink if there is one.
  */
  function start() {

    appState.loaded = true;

    // Make sure we've got all the DOM elements we need
    setupDOM();

    // Listen to messages posted to this window
    setupPostMessage();

    // Prevent the slides from being scrolled out of view
    setupScrollPrevention();

    // Resets all vertical slides so that only the first is visible
    resetVerticalSlides();

    // Updates the presentation to match the current appState.configuration values
    configure();

    // Read the initial hash
    readURL();

    // Update all backgrounds
    updateBackground(true);

    // Notify listeners that the presentation is ready but use a 1ms
    // timeout to ensure it's not fired synchronously after #initialize()
    setTimeout(() => {
      // Enable transitions now that we're loaded
      appState.dom.slides.classList.remove('no-transition');

      appState.dom.wrapper.classList.add('ready');

      dispatchEvent('ready', {
        'indexh': appState.indexh,
        'indexv': appState.indexv,
        'currentSlide': appState.currentSlide
      });
    }, 1);

    // Special setup and appState.config is required when printing to PDF
    if (isPrintingPDF()) {
      removeEventListeners();

      // The document needs to have loaded for the PDF layout
      // measurements to be accurate
      if (document.readyState === 'complete') {
        setupPDF();
      } else {
        window.addEventListener('load', setupPDF);
      }
    }

  }

  /**
  * Finds and stores references to DOM elements which are
  * required by the presentation. If a required element is
  * not found, it is created.
  */
  function setupDOM() {

    // Prevent transitions while we're loading
    appState.dom.slides.classList.add('no-transition');

    if (appState.features.isMobileDevice) {
      appState.dom.wrapper.classList.add('no-hover');
    } else {
      appState.dom.wrapper.classList.remove('no-hover');
    }

    if (/iphone/gi.test(UA )) {
      appState.dom.wrapper.classList.add('ua-iphone');
    } else {
      appState.dom.wrapper.classList.remove('ua-iphone');
    }

    // Background element
    appState.dom.background = createSingletonNode(appState.dom.wrapper, 'div', 'backgrounds', null);

    // Progress bar
    appState.dom.progress = createSingletonNode(appState.dom.wrapper, 'div', 'progress', '<span></span>');
    appState.dom.progressbar = appState.dom.progress.querySelector('span');

    // Arrow controls
    appState.dom.controls = createSingletonNode(appState.dom.wrapper, 'aside', 'controls',
    '<button class="navigate-left" aria-label="previous slide"><div class="controls-arrow"></div></button>' +
    '<button class="navigate-right" aria-label="next slide"><div class="controls-arrow"></div></button>' +
    '<button class="navigate-up" aria-label="above slide"><div class="controls-arrow"></div></button>' +
    '<button class="navigate-down" aria-label="below slide"><div class="controls-arrow"></div></button>');

    // Slide number
    appState.dom.slideNumber = createSingletonNode(appState.dom.wrapper, 'div', 'slide-number', '');

    // Element containing notes that are visible to the audience
    appState.dom.speakerNotes = createSingletonNode(appState.dom.wrapper, 'div', 'speaker-notes', null);
    appState.dom.speakerNotes.setAttribute('data-prevent-swipe', '');
    appState.dom.speakerNotes.setAttribute('tabindex', '0');

    // Overlay graphic which is displayed during the paused mode
    createSingletonNode(appState.dom.wrapper, 'div', 'pause-overlay', null);

    appState.dom.wrapper.setAttribute('role', 'application');

    // There can be multiple instances of controls throughout the page
    appState.dom.controlsLeft = toArray(document.querySelectorAll('.navigate-left' ));
    appState.dom.controlsRight = toArray(document.querySelectorAll('.navigate-right' ));
    appState.dom.controlsUp = toArray(document.querySelectorAll('.navigate-up' ));
    appState.dom.controlsDown = toArray(document.querySelectorAll('.navigate-down' ));
    appState.dom.controlsPrev = toArray(document.querySelectorAll('.navigate-prev' ));
    appState.dom.controlsNext = toArray(document.querySelectorAll('.navigate-next' ));

    // The right and down arrows in the standard reveal.js controls
    appState.dom.controlsRightArrow = appState.dom.controls.querySelector('.navigate-right');
    appState.dom.controlsDownArrow = appState.dom.controls.querySelector('.navigate-down');

    appState.dom.statusDiv = createStatusDiv();
  }

  /**
  * Creates a hidden div with role aria-live to announce the
  * current slide content. Hide the div off-screen to make it
  * available only to Assistive Technologies.
  *
  * @return {HTMLElement}
  */
  function createStatusDiv() {

    let statusDiv = document.getElementById('aria-status-div');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.style.position = 'absolute';
      statusDiv.style.height = '1px';
      statusDiv.style.width = '1px';
      statusDiv.style.overflow = 'hidden';
      statusDiv.style.clip = 'rect(1px, 1px, 1px, 1px )';
      statusDiv.setAttribute('id', 'aria-status-div');
      statusDiv.setAttribute('aria-live', 'polite');
      statusDiv.setAttribute('aria-atomic','true');
      appState.dom.wrapper.appendChild(statusDiv);
    }
    return statusDiv;

  }

  /**
  * Converts the given HTML element into a string of text
  * that can be announced to a screen reader. Hidden
  * elements are excluded.
  */
  function getStatusText(node) {

    let text = '';

    // Text node
    if (node.nodeType === 3) {
      text += node.textContent;
    } else if (node.nodeType === 1) {
      // Element node

      const isAriaHidden = node.getAttribute('aria-hidden');
      const isDisplayHidden = window.getComputedStyle(node ).display === 'none';
      if (isAriaHidden !== 'true' && !isDisplayHidden) {

        toArray(node.childNodes ).forEach((child) => {
          text += getStatusText(child);
        });

      }

    }

    return text;

  }

  /**
  * Configures the presentation for printing to a static
  * PDF.
  */
  function setupPDF() {

    const slideSize = getComputedSlideSize(window.innerWidth, window.innerHeight);

    // Dimensions of the PDF pages
    const pageWidth = Math.floor(slideSize.width * (1 + appState.config.margin ));
    const pageHeight = Math.floor(slideSize.height * (1 + appState.config.margin ));

    // Dimensions of slides within the pages
    const slideWidth = slideSize.width;
    const slideHeight = slideSize.height;

    // Let the browser know what page size we want to print
    injectStyleSheet('@page{size:'+ pageWidth +'px '+ pageHeight +'px; margin: 0px;}');

    // Limit the size of certain elements to the dimensions of the slide
    injectStyleSheet('.reveal section>img, .reveal section>video, .reveal section>iframe{max-width: '+ slideWidth +'px; max-height:'+ slideHeight +'px}');

    document.body.classList.add('print-pdf');
    document.body.style.width = pageWidth + 'px';
    document.body.style.height = pageHeight + 'px';

    // Make sure stretch elements fit on slide
    layoutSlideContents(slideWidth, slideHeight);

    // Add each slide's index as attributes on itself, we need these
    // indices to generate slide numbers below
    toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)).forEach((hslide, h) => {
      hslide.setAttribute('data-index-h', h);

      if (hslide.classList.contains('stack' )) {
        toArray(hslide.querySelectorAll('section' ) ).forEach((vslide, v) => {
          vslide.setAttribute('data-index-h', h);
          vslide.setAttribute('data-index-v', v);
        });
      }
    });

    // Slide and slide background layout
    toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR ) ).forEach((slide) => {

      // Vertical stacks are not centred since their section
      // children will be
      if (slide.classList.contains('stack' ) === false) {
        // Center the slide inside of the page, giving the slide some margin
        const left = (pageWidth - slideWidth ) / 2;
        let top = (pageHeight - slideHeight ) / 2;

        const contentHeight = slide.scrollHeight;
        let numberOfPages = Math.max(Math.ceil(contentHeight / pageHeight ), 1);

        // Adhere to configured pages per slide limit
        numberOfPages = Math.min(numberOfPages, appState.config.pdfMaxPagesPerSlide);

        // Center slides vertically
        if (numberOfPages === 1 && appState.config.center || slide.classList.contains('center' )) {
          top = Math.max((pageHeight - contentHeight ) / 2, 0);
        }

        // Wrap the slide in a page element and hide its overflow
        // so that no page ever flows onto another
        const page = document.createElement('div');
        page.className = 'pdf-page';
        page.style.height = ((pageHeight + appState.config.pdfPageHeightOffset ) * numberOfPages ) + 'px';
        slide.parentNode.insertBefore(page, slide);
        page.appendChild(slide);

        // Position the slide inside of the page
        slide.style.left = left + 'px';
        slide.style.top = top + 'px';
        slide.style.width = slideWidth + 'px';

        if (slide.slideBackgroundElement) {
          page.insertBefore(slide.slideBackgroundElement, slide);
        }

        // Inject notes if `showNotes` is enabled
        if (appState.config.showNotes) {

          // Are there notes for this slide?
          const notes = getSlideNotes(slide);
          if (notes) {

            const notesSpacing = 8;
            const notesLayout = typeof appState.config.showNotes === 'string' ? appState.config.showNotes : 'inline';
            const notesElement = document.createElement('div');
            notesElement.classList.add('speaker-notes');
            notesElement.classList.add('speaker-notes-pdf');
            notesElement.setAttribute('data-layout', notesLayout);
            notesElement.innerHTML = notes;

            if (notesLayout === 'separate-page') {
              page.parentNode.insertBefore(notesElement, page.nextSibling);
            } else {
              notesElement.style.left = notesSpacing + 'px';
              notesElement.style.bottom = notesSpacing + 'px';
              notesElement.style.width = (pageWidth - notesSpacing*2 ) + 'px';
              page.appendChild(notesElement);
            }

          }

        }

        // Inject slide numbers if `slideNumbers` are enabled
        if (appState.config.slideNumber && /all|print/i.test(appState.config.showSlideNumber )) {
          const slideNumberH = parseInt(slide.getAttribute('data-index-h' ), 10 ) + 1,
          slideNumberV = parseInt(slide.getAttribute('data-index-v' ), 10 ) + 1;

          const numberElement = document.createElement('div');
          numberElement.classList.add('slide-number');
          numberElement.classList.add('slide-number-pdf');
          numberElement.innerHTML = formatSlideNumber(slideNumberH, '.', slideNumberV);
          page.appendChild(numberElement);
        }
      }

    });

    // Show all fragments
    toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR + ' .fragment' ) ).forEach((fragment) => {
      fragment.classList.add('visible');
    });

    // Notify subscribers that the PDF layout is good to go
    dispatchEvent('pdf-ready');

  }

  /**
  * This is an unfortunate necessity. Some actions – such as
  * an input field being focused in an iframe or using the
  * keyboard to expand text selection beyond the bounds of
  * a slide – can trigger our content to be pushed out of view.
  * This scrolling can not be prevented by hiding overflow in
  * CSS (we already do) so we have to resort to repeatedly
  * checking if the slides have been offset :(
  */
  function setupScrollPrevention() {

    setInterval(() => {
      if (appState.dom.wrapper.scrollTop !== 0 || appState.dom.wrapper.scrollLeft !== 0) {
        appState.dom.wrapper.scrollTop = 0;
        appState.dom.wrapper.scrollLeft = 0;
      }
    }, 1000);

  }

  /**
  * Creates an HTML element and returns a reference to it.
  * If the element already exists the existing instance will
  * be returned.
  *
  * @param {HTMLElement} container
  * @param {string} tagname
  * @param {string} classname
  * @param {string} innerHTML
  *
  * @return {HTMLElement}
  */
  function createSingletonNode(container, tagname, classname, innerHTML) {

    // Find all nodes matching the description
    const nodes = container.querySelectorAll('.' + classname);

    // Check all matches to find one which is a direct child of
    // the specified container
    for (let i = 0; i < nodes.length; i++) {
      const testNode = nodes[i];
      if (testNode.parentNode === container) {
        return testNode;
      }
    }

    // If no node was found, create it now
    const node = document.createElement(tagname);
    node.className = classname;
    if (typeof innerHTML === 'string') {
      node.innerHTML = innerHTML;
    }
    container.appendChild(node);

    return node;

  }

  /**
  * Creates the slide background elements and appends them
  * to the background container. One element is created per
  * slide no matter if the given slide has visible background.
  */
  function createBackgrounds() {

    const printMode = isPrintingPDF();

    // Clear prior backgrounds
    appState.dom.background.innerHTML = '';
    appState.dom.background.classList.add('no-transition');

    // Iterate over all horizontal slides
    toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ) ).forEach( (slideh) => {

      const backgroundStack = createBackground(slideh, appState.dom.background);

      // Iterate over all vertical slides
      toArray(slideh.querySelectorAll('section' ) ).forEach( (slidev) => {

        createBackground(slidev, backgroundStack);

        backgroundStack.classList.add('stack');

      });

    });

    // Add parallax background if specified
    if (appState.config.parallaxBackgroundImage) {

      appState.dom.background.style.backgroundImage = 'url("' + appState.config.parallaxBackgroundImage + '")';
      appState.dom.background.style.backgroundSize = appState.config.parallaxBackgroundSize;

      // Make sure the below properties are set on the element - these properties are
      // needed for proper transitions to be set on the element via CSS. To remove
      // annoying background slide-in effect when the presentation starts, apply
      // these properties after short time delay
      setTimeout( () => {
        appState.dom.wrapper.classList.add('has-parallax-background');
      }, 1);

    } else {

      appState.dom.background.style.backgroundImage = '';
      appState.dom.wrapper.classList.remove('has-parallax-background');

    }

  }

  /**
  * Creates a background for the given slide.
  *
  * @param {HTMLElement} slide
  * @param {HTMLElement} container The element that the background
  * should be appended to
  * @return {HTMLElement} New background div
  */
  function createBackground(slide, container) {

    const data = {
      background: slide.getAttribute('data-background' ),
      backgroundSize: slide.getAttribute('data-background-size' ),
      backgroundImage: slide.getAttribute('data-background-image' ),
      backgroundVideo: slide.getAttribute('data-background-video' ),
      backgroundIframe: slide.getAttribute('data-background-iframe' ),
      backgroundColor: slide.getAttribute('data-background-color' ),
      backgroundRepeat: slide.getAttribute('data-background-repeat' ),
      backgroundPosition: slide.getAttribute('data-background-position' ),
      backgroundTransition: slide.getAttribute('data-background-transition' )
    };

    const element = document.createElement('div');

    // Carry over custom classes from the slide to the background
    element.className = 'slide-background ' + slide.className.replace(/present|past|future/, '');

    if (data.background) {
      // Auto-wrap image urls in url(...)
      if (/^(http|file|\/\/)/gi.test(data.background ) || /\.(svg|png|jpg|jpeg|gif|bmp)([?#]|$)/gi.test(data.background )) {
        slide.setAttribute('data-background-image', data.background);
      } else {
        element.style.background = data.background;
      }
    }

    // Create a hash for this combination of background settings.
    // This is used to determine when two slide backgrounds are
    // the same.
    if (data.background || data.backgroundColor || data.backgroundImage || data.backgroundVideo || data.backgroundIframe) {
      element.setAttribute('data-background-hash', data.background +
      data.backgroundSize +
      data.backgroundImage +
      data.backgroundVideo +
      data.backgroundIframe +
      data.backgroundColor +
      data.backgroundRepeat +
      data.backgroundPosition +
      data.backgroundTransition);
    }

    // Additional and optional background properties
    if (data.backgroundSize ) element.style.backgroundSize = data.backgroundSize;
    if (data.backgroundSize ) element.setAttribute('data-background-size', data.backgroundSize);
    if (data.backgroundColor ) element.style.backgroundColor = data.backgroundColor;
    if (data.backgroundRepeat ) element.style.backgroundRepeat = data.backgroundRepeat;
    if (data.backgroundPosition ) element.style.backgroundPosition = data.backgroundPosition;
    if (data.backgroundTransition ) element.setAttribute('data-background-transition', data.backgroundTransition);

    container.appendChild(element);

    // If backgrounds are being recreated, clear old classes
    slide.classList.remove('has-dark-background');
    slide.classList.remove('has-light-background');

    slide.slideBackgroundElement = element;

    // If this slide has a background color, add a class that
    // signals if it is light or dark. If the slide has no background
    // color, no class will be set
    const computedBackgroundStyle = window.getComputedStyle(element);
    if (computedBackgroundStyle && computedBackgroundStyle.backgroundColor) {
      const rgb = colorToRgb(computedBackgroundStyle.backgroundColor);

      // Ignore fully transparent backgrounds. Some browsers return
      // rgba(0,0,0,0) when reading the computed background color of
      // an element with no background
      if (rgb && rgb.a !== 0) {
        if (colorBrightness(computedBackgroundStyle.backgroundColor ) < 128) {
          slide.classList.add('has-dark-background');
        } else {
          slide.classList.add('has-light-background');
        }
      }
    }

    return element;

  }

  /**
  * Registers a listener to postMessage events, this makes it
  * possible to call all reveal.js API methods from another
  * window. For example:
  *
  * revealWindow.postMessage(JSON.stringify({
  *   method: 'slide',
  *   args: [ 2 ]
  * }), '*');
  */
  function setupPostMessage() {

    if (appState.config.postMessage) {
      window.addEventListener('message', (event) => {
        let data = event.data;

        // Make sure we're dealing with JSON
        if (typeof data === 'string' && data.charAt(0 ) === '{' && data.charAt(data.length - 1 ) === '}') {
          data = JSON.parse(data);

          // Check if the requested method can be found
          if (data.method && typeof Reveal[data.method] === 'function') {
            Reveal[data.method].apply(Reveal, data.args);
          }
        }
      }, false);
    }

  }

  /**
  * Applies the appState.configuration settings from the appState.config
  * object. May be called multiple times.
  *
  * @param {object} options
  */
  function configure(options) {

    const oldTransition = appState.config.transition;

    // New appState.config options may be passed when this method
    // is invoked through the API after initialization
    if (typeof options === 'object' ) Object.assign(config, options);

    // Abort if reveal.js hasn't finished loading, appState.config
    // changes will be applied automatically once loading
    // finishes
    if (appState.loaded === false ) return;

    const numberOfSlides = appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR ).length;

    // Remove the previously configured transition class
    appState.dom.wrapper.classList.remove(oldTransition);

    // Force linear transition based on browser capabilities
    if (appState.features.transforms3d === false ) appState.config.transition = 'linear';

    appState.dom.wrapper.classList.add(appState.config.transition);

    appState.dom.wrapper.setAttribute('data-transition-speed', appState.config.transitionSpeed);
    appState.dom.wrapper.setAttribute('data-background-transition', appState.config.backgroundTransition);

    appState.dom.controls.style.display = appState.config.controls ? 'block' : 'none';
    appState.dom.progress.style.display = appState.config.progress ? 'block' : 'none';

    appState.dom.controls.setAttribute('data-controls-layout', appState.config.controlsLayout);
    appState.dom.controls.setAttribute('data-controls-back-arrows', appState.config.controlsBackArrows);

    if (appState.config.shuffle) {
      shuffle();
    }

    if (appState.config.rtl) {
      appState.dom.wrapper.classList.add('rtl');
    } else {
      appState.dom.wrapper.classList.remove('rtl');
    }

    if (appState.config.center) {
      appState.dom.wrapper.classList.add('center');
    } else {
      appState.dom.wrapper.classList.remove('center');
    }

    // Exit the paused mode if it was configured off
    if (appState.config.pause === false) {
      resume();
    }

    if (appState.config.showNotes) {
      appState.dom.speakerNotes.setAttribute('data-layout', typeof appState.config.showNotes === 'string' ? appState.config.showNotes : 'inline');
    }

    if (appState.config.mouseWheel) {
      document.addEventListener('DOMMouseScroll', onDocumentMouseScroll, false); // FF
      document.addEventListener('mousewheel', onDocumentMouseScroll, false);
    } else {
      document.removeEventListener('DOMMouseScroll', onDocumentMouseScroll, false); // FF
      document.removeEventListener('mousewheel', onDocumentMouseScroll, false);
    }

    // Rolling 3D links
    if (appState.config.rollingLinks) {
      enableRollingLinks();
    } else {
      disableRollingLinks();
    }

    // Iframe link previews
    if (appState.config.previewLinks) {
      enablePreviewLinks();
      disablePreviewLinks('[data-preview-link=false]');
    } else {
      disablePreviewLinks();
      enablePreviewLinks('[data-preview-link]:not([data-preview-link=false])');
    }

    // Remove existing auto-slide controls
    if (appState.autoSlidePlayer) {
      appState.autoSlidePlayer.destroy();
      appState.autoSlidePlayer = null;
    }

    // Generate auto-slide controls if needed
    if (numberOfSlides > 1 && appState.config.autoSlide && appState.config.autoSlideStoppable && appState.features.canvas && appState.features.requestAnimationFrame) {
      appState.autoSlidePlayer = new Playback(appState.dom.wrapper, () => {
        return Math.min(Math.max((Date.now() - appState.autoSlideStartTime ) / appState.autoSlide, 0 ), 1);
      });

      appState.autoSlidePlayer.on('click', onAutoSlidePlayerClick);
      appState.autoSlidePaused = false;
    }

    // When fragments are turned off they should be visible
    if (appState.config.fragments === false) {
      toArray(appState.dom.slides.querySelectorAll('.fragment' ) ).forEach( (element) => {
        element.classList.add('visible');
        element.classList.remove('current-fragment');
      });
    }

    // Slide numbers
    let slideNumberDisplay = 'none';
    if (appState.config.slideNumber && !isPrintingPDF()) {
      if (appState.config.showSlideNumber === 'all') {
        slideNumberDisplay = 'block';
      } else if (appState.config.showSlideNumber === 'speaker' && isSpeakerNotes()) {
        slideNumberDisplay = 'block';
      }
    }

    appState.dom.slideNumber.style.display = slideNumberDisplay;

    sync();

  }

  /**
  * Binds all event listeners.
  */
  function addEventListeners() {

    appState.eventsAreBound = true;

    window.addEventListener('hashchange', onWindowHashChange, false);
    window.addEventListener('resize', onWindowResize, false);

    if (appState.config.touch) {
      appState.dom.wrapper.addEventListener('touchstart', onTouchStart, false);
      appState.dom.wrapper.addEventListener('touchmove', onTouchMove, false);
      appState.dom.wrapper.addEventListener('touchend', onTouchEnd, false);

      // Support pointer-style touch interaction as well
      if (window.navigator.pointerEnabled) {
        // IE 11 uses un-prefixed version of pointer events
        appState.dom.wrapper.addEventListener('pointerdown', onPointerDown, false);
        appState.dom.wrapper.addEventListener('pointermove', onPointerMove, false);
        appState.dom.wrapper.addEventListener('pointerup', onPointerUp, false);
      } else if (window.navigator.msPointerEnabled) {
        // IE 10 uses prefixed version of pointer events
        appState.dom.wrapper.addEventListener('MSPointerDown', onPointerDown, false);
        appState.dom.wrapper.addEventListener('MSPointerMove', onPointerMove, false);
        appState.dom.wrapper.addEventListener('MSPointerUp', onPointerUp, false);
      }
    }

    if (appState.config.keyboard) {
      document.addEventListener('keydown', onDocumentKeyDown, false);
      document.addEventListener('keypress', onDocumentKeyPress, false);
    }

    if (appState.config.progress && appState.dom.progress) {
      appState.dom.progress.addEventListener('click', onProgressClicked, false);
    }

    if (appState.config.focusBodyOnPageVisibilityChange) {
      let visibilityChange;

      if ('hidden' in document) {
        visibilityChange = 'visibilitychange';
      } else if ('msHidden' in document) {
        visibilityChange = 'msvisibilitychange';
      } else if ('webkitHidden' in document) {
        visibilityChange = 'webkitvisibilitychange';
      }

      if (visibilityChange) {
        document.addEventListener(visibilityChange, onPageVisibilityChange, false);
      }
    }

    // Listen to both touch and click events, in case the device
    // supports both
    let pointerEvents = [ 'touchstart', 'click' ];

    // Only support touch for Android, fixes double navigations in
    // stock browser
    if (UA.match(/android/gi )) {
      pointerEvents = [ 'touchstart' ];
    }

    pointerEvents.forEach( (eventName) => {
      appState.dom.controlsLeft.forEach( (el) => el.addEventListener(eventName, onNavigateLeftClicked, false) );
      appState.dom.controlsRight.forEach( (el) => el.addEventListener(eventName, onNavigateRightClicked, false) );
      appState.dom.controlsUp.forEach( (el) => el.addEventListener(eventName, onNavigateUpClicked, false) );
      appState.dom.controlsDown.forEach( (el) => el.addEventListener(eventName, onNavigateDownClicked, false) );
      appState.dom.controlsPrev.forEach( (el) => el.addEventListener(eventName, onNavigatePrevClicked, false) );
      appState.dom.controlsNext.forEach( (el) => el.addEventListener(eventName, onNavigateNextClicked, false) );
    });

  }

  /**
  * Unbinds all event listeners.
  */
  function removeEventListeners() {

    appState.eventsAreBound = false;

    document.removeEventListener('keydown', onDocumentKeyDown, false);
    document.removeEventListener('keypress', onDocumentKeyPress, false);
    window.removeEventListener('hashchange', onWindowHashChange, false);
    window.removeEventListener('resize', onWindowResize, false);

    appState.dom.wrapper.removeEventListener('touchstart', onTouchStart, false);
    appState.dom.wrapper.removeEventListener('touchmove', onTouchMove, false);
    appState.dom.wrapper.removeEventListener('touchend', onTouchEnd, false);

    // IE11
    if (window.navigator.pointerEnabled) {
      appState.dom.wrapper.removeEventListener('pointerdown', onPointerDown, false);
      appState.dom.wrapper.removeEventListener('pointermove', onPointerMove, false);
      appState.dom.wrapper.removeEventListener('pointerup', onPointerUp, false);
    } else if (window.navigator.msPointerEnabled) {
      // IE10
      appState.dom.wrapper.removeEventListener('MSPointerDown', onPointerDown, false);
      appState.dom.wrapper.removeEventListener('MSPointerMove', onPointerMove, false);
      appState.dom.wrapper.removeEventListener('MSPointerUp', onPointerUp, false);
    }

    if (appState.config.progress && appState.dom.progress) {
      appState.dom.progress.removeEventListener('click', onProgressClicked, false);
    }

    [ 'touchstart', 'click' ].forEach( (eventName) => {
      appState.dom.controlsLeft.forEach( (el) => el.removeEventListener(eventName, onNavigateLeftClicked, false));
      appState.dom.controlsRight.forEach( (el) => el.removeEventListener(eventName, onNavigateRightClicked, false));
      appState.dom.controlsUp.forEach( (el) => el.removeEventListener(eventName, onNavigateUpClicked, false));
      appState.dom.controlsDown.forEach( (el) => el.removeEventListener(eventName, onNavigateDownClicked, false));
      appState.dom.controlsPrev.forEach( (el) => el.removeEventListener(eventName, onNavigatePrevClicked, false));
      appState.dom.controlsNext.forEach( (el) => el.removeEventListener(eventName, onNavigateNextClicked, false));
    });

  }


  /**
  * Converts the target object to an array.
  *
  * @param {object} o
  * @return {object[]}
  */
  function toArray(o) {

    return Array.prototype.slice.call(o);

  }

  /**
  * Utility for deserializing a value.
  *
  * @param {*} value
  * @return {*}
  */
  function deserialize(value) {

    if (typeof value === 'string') {
      if (value === 'null' ) return null; else if (value === 'true' ) return true; else if (value === 'false' ) return false; else if (value.match(/^-?[\d.]+$/ ) ) return parseFloat(value);
    }

    return value;

  }

  /**
  * Measures the distance in pixels between point a
  * and point b.
  *
  * @param {object} a point with x/y properties
  * @param {object} b point with x/y properties
  *
  * @return {number}
  */
  function distanceBetween(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);

  }

  /**
  * Applies a CSS transform to the target element.
  *
  * @param {HTMLElement} element
  * @param {string} transform
  */
  function transformElement(element, transform) {

    element.style.WebkitTransform = transform;
    element.style.MozTransform = transform;
    element.style.msTransform = transform;
    element.style.transform = transform;

  }

  /**
  * Applies CSS transforms to the slides container. The container
  * is transformed from two separate sources: layout and the overview
  * mode.
  *
  * @param {object} transforms
  */
  function transformSlides(transforms) {

    // Pick up new transforms from arguments
    if (typeof transforms.layout === 'string' ) appState.slidesTransform.layout = transforms.layout;
    if (typeof transforms.overview === 'string' ) appState.slidesTransform.overview = transforms.overview;

    // Apply the transforms to the slides container
    if (appState.slidesTransform.layout) {
      transformElement(appState.dom.slides, appState.slidesTransform.layout + ' ' + appState.slidesTransform.overview);
    } else {
      transformElement(appState.dom.slides, appState.slidesTransform.overview);
    }

  }

  /**
  * Injects the given CSS styles into the DOM.
  *
  * @param {string} value
  */
  function injectStyleSheet(value) {

    const tag = document.createElement('style');
    tag.type = 'text/css';
    if (tag.styleSheet) {
      tag.styleSheet.cssText = value;
    } else {
      tag.appendChild(document.createTextNode(value ));
    }
    document.getElementsByTagName('head' )[0].appendChild(tag);

  }

  /**
  * Find the closest parent that matches the given
  * selector.
  *
  * @param {HTMLElement} target The child element
  * @param {String} selector The CSS selector to match
  * the parents against
  *
  * @return {HTMLElement} The matched parent or null
  * if no matching parent was found
  */
  function closestParent(target, selector) {

    let parent = target.parentNode;

    while (parent) {

      // There's some overhead doing this each time, we don't
      // want to rewrite the element prototype but should still
      // be enough to feature detect once at startup...
      const matchesMethod = parent.matches || parent.matchesSelector || parent.msMatchesSelector;

      // If we find a match, we're all set
      if (matchesMethod && matchesMethod.call(parent, selector )) {
        return parent;
      }

      // Keep searching
      parent = parent.parentNode;

    }

    return null;

  }

  /**
  * Converts various color input formats to an {r:0,g:0,b:0} object.
  *
  * @param {string} color The string representation of a color
  * @example
  * colorToRgb('#000');
  * @example
  * colorToRgb('#000000');
  * @example
  * colorToRgb('rgb(0,0,0)');
  * @example
  * colorToRgb('rgba(0,0,0)');
  *
  * @return {{r: number, g: number, b: number, [a]: number}|null}
  */
  function colorToRgb(color) {

    let hex3 = color.match(/^#([0-9a-f]{3})$/i);
    if (hex3 && hex3[1]) {
      hex3 = hex3[1];
      return {
        r: parseInt(hex3.charAt(0 ), 16 ) * 0x11,
        g: parseInt(hex3.charAt(1 ), 16 ) * 0x11,
        b: parseInt(hex3.charAt(2 ), 16 ) * 0x11
      };
    }

    let hex6 = color.match(/^#([0-9a-f]{6})$/i);
    if (hex6 && hex6[1]) {
      hex6 = hex6[1];
      return {
        r: parseInt(hex6.substr(0, 2 ), 16 ),
        g: parseInt(hex6.substr(2, 2 ), 16 ),
        b: parseInt(hex6.substr(4, 2 ), 16 )
      };
    }

    const rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgb) {
      return {
        r: parseInt(rgb[1], 10 ),
        g: parseInt(rgb[2], 10 ),
        b: parseInt(rgb[3], 10 )
      };
    }

    const rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i);
    if (rgba) {
      return {
        r: parseInt(rgba[1], 10 ),
        g: parseInt(rgba[2], 10 ),
        b: parseInt(rgba[3], 10 ),
        a: parseFloat(rgba[4] )
      };
    }

    return null;

  }

  /**
  * Calculates brightness on a scale of 0-255.
  *
  * @param {string} color See colorToRgb for supported formats.
  * @see {@link colorToRgb}
  */
  function colorBrightness(color) {

    if (typeof color === 'string' ) color = colorToRgb(color);

    if (color) {
      return (color.r * 299 + color.g * 587 + color.b * 114 ) / 1000;
    }

    return null;

  }

  /**
  * Returns the remaining height within the parent of the
  * target element.
  *
  * remaining height = [ configured parent height ] - [ current parent height ]
  *
  * @param {HTMLElement} element
  * @param {number} [height]
  */
  function getRemainingHeight(element, height) {

    height = height || 0;

    if (element) {
      const oldHeight = element.style.height;

      // Change the .stretch element height to 0 in order find the height of all
      // the other elements
      element.style.height = '0px';
      const newHeight = height - element.parentNode.offsetHeight;

      // Restore the old height, just in case
      element.style.height = oldHeight + 'px';

      return newHeight;
    }

    return height;

  }

  /**
  * Checks if this instance is being used to print a PDF.
  */
  function isPrintingPDF() {

    return (/print-pdf/gi ).test(window.location.search);

  }

  /**
  * Hides the address bar if we're on a mobile device.
  */
  function hideAddressBar() {

    if (appState.config.hideAddressBar && appState.features.isMobileDevice) {
      // Events that should trigger the address bar to hide
      window.addEventListener('load', removeAddressBar, false);
      window.addEventListener('orientationchange', removeAddressBar, false);
    }

  }

  /**
  * Causes the address bar to hide on mobile devices,
  * more vertical space ftw.
  */
  function removeAddressBar() {

    setTimeout( () => {
      window.scrollTo(0, 1);
    }, 10);

  }

  /**
  * Dispatches an event of the specified type from the
  * reveal DOM element.
  */
  function dispatchEvent(type, args) {

    const event = document.createEvent('HTMLEvents', 1, 2);
    event.initEvent(type, true, true);
    Object.assign(event, args);
    appState.dom.wrapper.dispatchEvent(event);

    // If we're in an iframe, post each reveal.js event to the
    // parent window. Used by the notes plugin
    if (appState.config.postMessageEvents && window.parent !== window.self) {
      window.parent.postMessage(JSON.stringify({ namespace: 'reveal', eventName: type, state: getState() }), '*');
    }

  }

  /**
  * Wrap all links in 3D goodness.
  */
  function enableRollingLinks() {

    if (appState.features.transforms3d && !('msPerspective' in document.body.style )) {
      const anchors = appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR + ' a');

      for (let i = 0, len = anchors.length; i < len; i++) {
        const anchor = anchors[i];

        if (anchor.textContent && !anchor.querySelector('*' ) && (!anchor.className || !anchor.classList.contains(anchor, 'roll' ) )) {
          const span = document.createElement('span');
          span.setAttribute('data-title', anchor.text);
          span.innerHTML = anchor.innerHTML;

          anchor.classList.add('roll');
          anchor.innerHTML = '';
          anchor.appendChild(span);
        }
      }
    }

  }

  /**
  * Unwrap all 3D links.
  */
  function disableRollingLinks() {

    const anchors = appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR + ' a.roll');

    for (let i = 0, len = anchors.length; i < len; i++) {
      const anchor = anchors[i];
      const span = anchor.querySelector('span');

      if (span) {
        anchor.classList.remove('roll');
        anchor.innerHTML = span.innerHTML;
      }
    }

  }

  /**
  * Bind preview frame links.
  *
  * @param {string} [selector=a] - selector for anchors
  */
  function enablePreviewLinks(selector) {

    const anchors = toArray(document.querySelectorAll(selector ? selector : 'a' ));

    anchors.forEach( (element) => {
      if (/^(http|www)/gi.test(element.getAttribute('href' ) )) {
        element.addEventListener('click', onPreviewLinkClicked, false);
      }
    });

  }

  /**
  * Unbind preview frame links.
  */
  function disablePreviewLinks(selector) {

    const anchors = toArray(document.querySelectorAll(selector ? selector : 'a' ));

    anchors.forEach( (element) => {
      if (/^(http|www)/gi.test(element.getAttribute('href' ) )) {
        element.removeEventListener('click', onPreviewLinkClicked, false);
      }
    });

  }

  /**
  * Opens a preview window for the target URL.
  *
  * @param {string} url - url for preview iframe src
  */
  function showPreview(url) {

    closeOverlay();

    appState.dom.overlay = document.createElement('div');
    appState.dom.overlay.classList.add('overlay');
    appState.dom.overlay.classList.add('overlay-preview');
    appState.dom.wrapper.appendChild(appState.dom.overlay);

    appState.dom.overlay.innerHTML = [
      '<header>',
      '<a class="close" href="#"><span class="icon"></span></a>',
      '<a class="external" href="'+ url +'" target="_blank"><span class="icon"></span></a>',
      '</header>',
      '<div class="spinner"></div>',
      '<div class="viewport">',
      '<iframe src="'+ url +'"></iframe>',
      '<small class="viewport-inner">',
      '<span class="x-frame-error">Unable to load iframe. This is likely due to the site\'s policy (x-frame-options).</span>',
      '</small>',
      '</div>'
    ].join('');

    appState.dom.overlay.querySelector('iframe' ).addEventListener('load', () => {
      appState.dom.overlay.classList.add('loaded');
    }, false);

    appState.dom.overlay.querySelector('.close' ).addEventListener('click', (event) => {
      closeOverlay();
      event.preventDefault();
    }, false);

    appState.dom.overlay.querySelector('.external' ).addEventListener('click', () => {
      closeOverlay();
    }, false);

    setTimeout( () => {
      appState.dom.overlay.classList.add('visible');
    }, 1);

  }

  /**
  * Open or close help overlay window.
  *
  * @param {Boolean} [override] Flag which overrides the
  * toggle logic and forcibly sets the desired state. True means
  * help is open, false means it's closed.
  */
  function toggleHelp(override ) {

    if (typeof override === 'boolean') {
      override ? showHelp() : closeOverlay();
    } else {
      if (appState.dom.overlay) {
        closeOverlay();
      } else {
        showHelp();
      }
    }
  }

  /**
  * Opens an overlay window with help material.
  */
  function showHelp() {

    if (appState.config.help) {

      closeOverlay();

      appState.dom.overlay = document.createElement('div');
      appState.dom.overlay.classList.add('overlay');
      appState.dom.overlay.classList.add('overlay-help');
      appState.dom.wrapper.appendChild(appState.dom.overlay);

      let html = '<p class="title">Keyboard Shortcuts</p><br/>';

      html += '<table><th>KEY</th><th>ACTION</th>';
      for (const key in keyboardShortcuts) {
        html += '<tr><td>' + key + '</td><td>' + keyboardShortcuts[ key ] + '</td></tr>';
      }

      html += '</table>';

      appState.dom.overlay.innerHTML = [
        '<header>',
        '<a class="close" href="#"><span class="icon"></span></a>',
        '</header>',
        '<div class="viewport">',
        '<div class="viewport-inner">'+ html +'</div>',
        '</div>'
      ].join('');

      appState.dom.overlay.querySelector('.close' ).addEventListener('click', (event) => {
        closeOverlay();
        event.preventDefault();
      }, false);

      setTimeout( () => {
        appState.dom.overlay.classList.add('visible');
      }, 1);

    }

  }

  /**
  * Closes any currently open overlay.
  */
  function closeOverlay() {

    if (appState.dom.overlay) {
      appState.dom.overlay.parentNode.removeChild(appState.dom.overlay);
      appState.dom.overlay = null;
    }

  }

  /**
  * Applies JavaScript-controlled layout rules to the
  * presentation.
  */
  function layout() {

    if (appState.dom.wrapper && !isPrintingPDF()) {

      const size = getComputedSlideSize();

      // Layout the contents of the slides
      layoutSlideContents(appState.config.width, appState.config.height);

      appState.dom.slides.style.width = size.width + 'px';
      appState.dom.slides.style.height = size.height + 'px';

      // Determine scale of content to fit within available space
      appState.scale = Math.min(size.presentationWidth / size.width, size.presentationHeight / size.height);

      // Respect max/min scale settings
      appState.scale = Math.max(appState.scale, appState.config.minScale);
      appState.scale = Math.min(appState.scale, appState.config.maxScale);

      // Don't apply any scaling styles if scale is 1
      if (appState.scale === 1) {
        appState.dom.slides.style.zoom = '';
        appState.dom.slides.style.left = '';
        appState.dom.slides.style.top = '';
        appState.dom.slides.style.bottom = '';
        appState.dom.slides.style.right = '';
        transformSlides({ layout: '' });
      } else {
        // Prefer zoom for scaling up so that content remains crisp.
        // Don't use zoom to scale down since that can lead to shifts
        // in text layout/line breaks.
        if (appState.scale > 1 && appState.features.zoom) {
          appState.dom.slides.style.zoom = appState.scale;
          appState.dom.slides.style.left = '';
          appState.dom.slides.style.top = '';
          appState.dom.slides.style.bottom = '';
          appState.dom.slides.style.right = '';
          transformSlides({ layout: '' });
        } else {
          // Apply scale transform as a fallback
          appState.dom.slides.style.zoom = '';
          appState.dom.slides.style.left = '50%';
          appState.dom.slides.style.top = '50%';
          appState.dom.slides.style.bottom = 'auto';
          appState.dom.slides.style.right = 'auto';
          transformSlides({ layout: 'translate(-50%, -50%) scale('+ appState.scale +')' });
        }
      }

      // Select all slides, vertical and horizontal
      const slides = toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR ));

      for (let i = 0, len = slides.length; i < len; i++) {
        let slide = slides[ i ];

        // Don't bother updating invisible slides
        if (slide.style.display === 'none') {
          continue;
        }

        if (appState.config.center || slide.classList.contains('center' )) {
          // Vertical stacks are not centred since their section
          // children will be
          if (slide.classList.contains('stack' )) {
            slide.style.top = 0;
          } else {
            slide.style.top = Math.max((size.height - slide.scrollHeight ) / 2, 0 ) + 'px';
          }
        } else {
          slide.style.top = '';
        }

      }

      updateProgress();
      updateParallax();

      if (isOverview()) {
        updateOverview();
      }

    }

  }

  /**
  * Applies layout logic to the contents of all slides in
  * the presentation.
  *
  * @param {string|number} width
  * @param {string|number} height
  */
  function layoutSlideContents(width, height) {

    // Handle sizing of elements with the 'stretch' class
    toArray(appState.dom.slides.querySelectorAll('section > .stretch' ) ).forEach( (element) => {

      // Determine how much vertical space we can use
      const remainingHeight = getRemainingHeight(element, height);

      // Consider the aspect ratio of media elements
      if (/(img|video)/gi.test(element.nodeName )) {
        const nw = element.naturalWidth || element.videoWidth;
        const nh = element.naturalHeight || element.videoHeight;

        const es = Math.min(width / nw, remainingHeight / nh);

        element.style.width = (nw * es ) + 'px';
        element.style.height = (nh * es ) + 'px';

      } else {
        element.style.width = width + 'px';
        element.style.height = remainingHeight + 'px';
      }

    });

  }

  /**
  * Calculates the computed pixel size of our slides. These
  * values are based on the width and height appState.configuration
  * options.
  *
  * @param {number} [presentationWidth=dom.wrapper.offsetWidth]
  * @param {number} [presentationHeight=dom.wrapper.offsetHeight]
  */
  function getComputedSlideSize(presentationWidth, presentationHeight) {

    const size = {
      // Slide size
      width: appState.config.width,
      height: appState.config.height,

      // Presentation size
      presentationWidth: presentationWidth || appState.dom.wrapper.offsetWidth,
      presentationHeight: presentationHeight || appState.dom.wrapper.offsetHeight
    };

    // Reduce available space by margin
    size.presentationWidth -= (size.presentationWidth * appState.config.margin);
    size.presentationHeight -= (size.presentationHeight * appState.config.margin);

    // Slide width may be a percentage of available width
    if (typeof size.width === 'string' && /%$/.test(size.width )) {
      size.width = parseInt(size.width, 10 ) / 100 * size.presentationWidth;
    }

    // Slide height may be a percentage of available height
    if (typeof size.height === 'string' && /%$/.test(size.height )) {
      size.height = parseInt(size.height, 10 ) / 100 * size.presentationHeight;
    }

    return size;

  }

  /**
  * Stores the vertical index of a stack so that the same
  * vertical slide can be selected when navigating to and
  * from the stack.
  *
  * @param {HTMLElement} stack The vertical stack element
  * @param {string|number} [v=0] Index to memorize
  */
  function setPreviousVerticalIndex(stack, v) {

    if (typeof stack === 'object' && typeof stack.setAttribute === 'function') {
      stack.setAttribute('data-previous-indexv', v || 0);
    }

  }

  /**
  * Retrieves the vertical index which was stored using
  * #setPreviousVerticalIndex() or 0 if no previous index
  * exists.
  *
  * @param {HTMLElement} stack The vertical stack element
  */
  function getPreviousVerticalIndex(stack) {

    if (typeof stack === 'object' && typeof stack.setAttribute === 'function' && stack.classList.contains('stack' )) {
      // Prefer manually defined start-appState.indexv
      const attributeName = stack.hasAttribute('data-start-indexv' ) ? 'data-start-indexv' : 'data-previous-indexv';

      return parseInt(stack.getAttribute(attributeName ) || 0, 10);
    }

    return 0;

  }

  /**
  * Displays the overview of slides (quick nav) by scaling
  * down and arranging all slide elements.
  */
  function activateOverview() {

    // Only proceed if enabled in appState.config
    if (appState.config.overview && !isOverview()) {

      appState.overview = true;

      appState.dom.wrapper.classList.add('overview');
      appState.dom.wrapper.classList.remove('overview-deactivating');

      if (appState.features.overviewTransitions) {
        setTimeout( () => {
          appState.dom.wrapper.classList.add('overview-animated');
        }, 1);
      }

      // Don't auto-slide while in overview mode
      cancelAutoSlide();

      // Move the backgrounds element into the slide container to
      // that the same scaling is applied
      appState.dom.slides.appendChild(appState.dom.background);

      // Clicking on an overview slide navigates to it
      toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR ) ).forEach( (slide) => {
        if (!slide.classList.contains('stack' )) {
          slide.addEventListener('click', onOverviewSlideClicked, true);
        }
      });

      // Calculate slide sizes
      const margin = 70;
      const slideSize = getComputedSlideSize();
      overviewSlideWidth = slideSize.width + margin;
      overviewSlideHeight = slideSize.height + margin;

      // Reverse in RTL mode
      if (appState.config.rtl) {
        overviewSlideWidth = -overviewSlideWidth;
      }

      updateSlidesVisibility();
      layoutOverview();
      updateOverview();

      layout();

      // Notify observers of the overview showing
      dispatchEvent('overviewshown', {
        'indexh': appState.indexh,
        'indexv': appState.indexv,
        'currentSlide': appState.currentSlide
      });

    }

  }

  /**
  * Uses CSS transforms to position all slides in a grid for
  * display inside of the overview mode.
  */
  function layoutOverview() {

    // Layout slides
    toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ) ).forEach( (hslide, h) => {
      hslide.setAttribute('data-index-h', h);
      transformElement(hslide, 'translate3d(' + (h * overviewSlideWidth ) + 'px, 0, 0)');

      if (hslide.classList.contains('stack' )) {

        toArray(hslide.querySelectorAll('section' ) ).forEach( (vslide, v) => {
          vslide.setAttribute('data-index-h', h);
          vslide.setAttribute('data-index-v', v);

          transformElement(vslide, 'translate3d(0, ' + (v * overviewSlideHeight ) + 'px, 0)');
        });

      }
    });

    // Layout slide backgrounds
    toArray(appState.dom.background.childNodes ).forEach( (hbackground, h) => {
      transformElement(hbackground, 'translate3d(' + (h * overviewSlideWidth ) + 'px, 0, 0)');

      toArray(hbackground.querySelectorAll('.slide-background' ) ).forEach( (vbackground, v) => {
        transformElement(vbackground, 'translate3d(0, ' + (v * overviewSlideHeight ) + 'px, 0)');
      });
    });

  }

  /**
  * Moves the overview viewport to the current slides.
  * Called each time the current slide changes.
  */
  function updateOverview() {

    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const scale = Math.max(vmin / 5, 150 ) / vmin;

    transformSlides({
      overview: [
        'scale('+ scale +')',
        'translateX('+ (-appState.indexh * overviewSlideWidth ) +'px)',
        'translateY('+ (-appState.indexv * overviewSlideHeight ) +'px)'
      ].join(' ' )
    });

  }

  /**
  * Exits the slide overview and enters the currently
  * active slide.
  */
  function deactivateOverview() {

    // Only proceed if enabled in appState.config
    if (appState.config.overview) {

      appState.overview = false;

      appState.dom.wrapper.classList.remove('overview');
      appState.dom.wrapper.classList.remove('overview-animated');

      // Temporarily add a class so that transitions can do different things
      // depending on whether they are exiting/entering overview, or just
      // moving from slide to slide
      appState.dom.wrapper.classList.add('overview-deactivating');

      setTimeout( () => {
        appState.dom.wrapper.classList.remove('overview-deactivating');
      }, 1);

      // Move the background element back out
      appState.dom.wrapper.appendChild(appState.dom.background);

      // Clean up changes made to slides
      toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR ) ).forEach( (slide) => {
        transformElement(slide, '');

        slide.removeEventListener('click', onOverviewSlideClicked, true);
      });

      // Clean up changes made to backgrounds
      toArray(appState.dom.background.querySelectorAll('.slide-background' ) ).forEach( (background) => {
        transformElement(background, '');
      });

      transformSlides({ overview: '' });

      navigateSlide(appState.indexh, appState.indexv);

      layout();

      cueAutoSlide();

      // Notify observers of the overview hiding
      dispatchEvent('overviewhidden', {
        'indexh': appState.indexh,
        'indexv': appState.indexv,
        'currentSlide': appState.currentSlide
      });

    }
  }

  /**
  * Toggles the slide overview mode on and off.
  *
  * @param {Boolean} [override] Flag which overrides the
  * toggle logic and forcibly sets the desired state. True means
  * overview is open, false means it's closed.
  */
  function toggleOverview(override) {

    if (typeof override === 'boolean') {
      override ? activateOverview() : deactivateOverview();
    } else {
      isOverview() ? deactivateOverview() : activateOverview();
    }

  }

  /**
  * Checks if the overview is currently active.
  *
  * @return {Boolean} true if the overview is active,
  * false otherwise
  */
  function isOverview() {

    return appState.overview;

  }

  /**
  * Checks if the current or specified slide is vertical
  * (nested within another slide).
  *
  * @param {HTMLElement} [slide=appState.currentSlide] The slide to check
  * orientation of
  * @return {Boolean}
  */
  function isVerticalSlide(slide) {

    // Prefer slide argument, otherwise use current slide
    slide = slide ? slide : appState.currentSlide;

    return slide && slide.parentNode && !!slide.parentNode.nodeName.match(/section/i);

  }

  /**
  * Handling the fullscreen functionality via the fullscreen API
  *
  * @see http://fullscreen.spec.whatwg.org/
  * @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
  */
  function enterFullscreen() {

    const element = document.documentElement;

    // Check which implementation is available
    const requestMethod = element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.webkitRequestFullScreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen;

    if (requestMethod) {
      requestMethod.apply(element);
    }

  }

  /**
  * Enters the paused mode which fades everything on screen to
  * black.
  */
  function pause() {

    if (appState.config.pause) {
      const wasPaused = appState.dom.wrapper.classList.contains('paused');

      cancelAutoSlide();
      appState.dom.wrapper.classList.add('paused');

      if (wasPaused === false) {
        dispatchEvent('paused');
      }
    }

  }

  /**
  * Exits from the paused mode.
  */
  function resume() {

    const wasPaused = appState.dom.wrapper.classList.contains('paused');
    appState.dom.wrapper.classList.remove('paused');

    cueAutoSlide();

    if (wasPaused) {
      dispatchEvent('resumed');
    }

  }

  /**
  * Toggles the paused mode on and off.
  */
  function togglePause(override) {

    if (typeof override === 'boolean') {
      override ? pause() : resume();
    } else {
      isPaused() ? resume() : pause();
    }

  }

  /**
  * Checks if we are currently in the paused mode.
  *
  * @return {Boolean}
  */
  function isPaused() {

    return appState.dom.wrapper.classList.contains('paused');

  }

  /**
  * Toggles the auto slide mode on and off.
  *
  * @param {Boolean} [override] Flag which sets the desired state.
  * True means autoplay starts, false means it stops.
  */

  function toggleAutoSlide(override) {

    if (typeof override === 'boolean') {
      override ? resumeAutoSlide() : pauseAutoSlide();
    }

    else {
      autoSlidePaused ? resumeAutoSlide() : pauseAutoSlide();
    }

  }

  /**
  * Checks if the auto slide mode is currently on.
  *
  * @return {Boolean}
  */
  function isAutoSliding() {

    return !!(appState.autoSlide && !appState.autoSlidePaused);

  }

  /**
  * Steps from the current point in the presentation to the
  * slide which matches the specified horizontal and vertical
  * indices.
  *
  * @param {number} [h=indexh] Horizontal index of the target slide
  * @param {number} [v=indexv] Vertical index of the target slide
  * @param {number} [f] Index of a fragment within the
  * target slide to activate
  * @param {number} [o] Origin for use in multimaster environments
  */
  function navigateSlide(h, v, f, o) {

    // Remember where we were at before
    appState.previousSlide = appState.currentSlide;

    // Query all horizontal slides in the deck
    const horizontalSlides = appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR);

    // Abort if there are no slides
    if (horizontalSlides.length === 0 ) return;

    // If no vertical index is specified and the upcoming slide is a
    // stack, resume at its previous vertical index
    if (v === undefined && !isOverview()) {
      v = getPreviousVerticalIndex(horizontalSlides[ h ]);
    }

    // If we were on a vertical stack, remember what vertical index
    // it was on so we can resume at the same position when returning
    if (appState.previousSlide && appState.previousSlide.parentNode && appState.previousSlide.parentNode.classList.contains('stack' )) {
      setPreviousVerticalIndex(appState.previousSlide.parentNode, appState.indexv);
    }

    // Remember the state before this slide
    const stateBefore = appState.state.concat();

    // Reset the state array
    appState.state.length = 0;

    const indexhBefore = appState.indexh || 0;
    const indexvBefore = appState.indexv || 0;

    // Activate and transition to the new slide
    appState.indexh = updateSlides(HORIZONTAL_SLIDES_SELECTOR, h === undefined ? appState.indexh : h);
    appState.indexv = updateSlides(VERTICAL_SLIDES_SELECTOR, v === undefined ? appState.indexv : v);

    // Update the visibility of slides now that the indices have changed
    updateSlidesVisibility();

    layout();

    // Apply the new state
    for (let i = 0, len = appState.state.length; i < len; i++) {
      // Check if this state existed on the previous slide. If it
      // did, we will avoid adding it repeatedly
      for (let j = 0; j < stateBefore.length; j++) {
        if (stateBefore[j] === appState.state[i]) {
          stateBefore.splice(j, 1);
          //continue;
        }
      }

      document.documentElement.classList.add(appState.state[i]);

      // Dispatch custom event matching the state's name
      dispatchEvent(appState.state[i]);
    }

    // Clean up the remains of the previous state
    while (stateBefore.length) {
      document.documentElement.classList.remove(stateBefore.pop());
    }

    // Update the overview if it's currently active
    if (isOverview()) {
      updateOverview();
    }

    // Find the current horizontal slide and any possible vertical slides
    // within it
    const currentHorizontalSlide = horizontalSlides[ appState.indexh ];
    const currentVerticalSlides = currentHorizontalSlide.querySelectorAll('section');

    // Store references to the previous and current slides
    appState.currentSlide = currentVerticalSlides[ appState.indexv ] || currentHorizontalSlide;

    // Show fragment, if specified
    if (typeof f !== 'undefined') {
      navigateFragment(f);
    }

    // Dispatch an event if the slide changed
    const slideChanged = (appState.indexh !== indexhBefore || appState.indexv !== indexvBefore);
    if (slideChanged) {
      dispatchEvent('slidechanged', {
        'indexh': appState.indexh,
        'indexv': appState.indexv,
        'previousSlide': appState.previousSlide,
        'currentSlide': appState.currentSlide,
        'origin': o
      });
    } else {
      // Ensure that the previous slide is never the same as the current
      appState.previousSlide = null;
    }

    // Solves an edge case where the previous slide maintains the
    // 'present' class when navigating between adjacent vertical
    // stacks
    if (appState.previousSlide) {
      appState.previousSlide.classList.remove('present');
      appState.previousSlide.setAttribute('aria-hidden', 'true');

      // Reset all slides upon navigate to home
      // Issue: #285
      if (appState.dom.wrapper.querySelector(HOME_SLIDE_SELECTOR ).classList.contains('present' )) {
        // Launch async task
        setTimeout( () => {
          const slides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR + '.stack'), i);
          for (i in slides) {
            if (slides[i]) {
              // Reset stack
              setPreviousVerticalIndex(slides[i], 0);
            }
          }
        }, 0);
      }
    }

    // Handle embedded content
    if (slideChanged || !appState.previousSlide) {
      stopEmbeddedContent(appState.previousSlide);
      startEmbeddedContent(appState.currentSlide);
    }

    // Announce the current slide contents, for screen readers
    appState.dom.statusDiv.textContent = getStatusText(appState.currentSlide);

    updateControls();
    updateProgress();
    updateBackground();
    updateParallax();
    updateSlideNumber();
    updateNotes();

    // Update the URL hash
    writeURL();

    cueAutoSlide();

  }

  /**
  * Syncs the presentation with the current DOM. Useful
  * when new slides or control elements are added or when
  * the appState.configuration has changed.
  */
  function sync() {

    // Subscribe to input
    removeEventListeners();
    addEventListeners();

    // Force a layout to make sure the current appState.config is accounted for
    layout();

    // Reflect the current autoSlide value
    appState.autoSlide = appState.config.autoSlide;

    // Start auto-sliding if it's enabled
    cueAutoSlide();

    // Re-create the slide backgrounds
    createBackgrounds();

    // Write the current hash to the URL
    writeURL();

    sortAllFragments();

    updateControls();
    updateProgress();
    updateSlideNumber();
    updateSlidesVisibility();
    updateBackground(true);
    updateNotesVisibility();
    updateNotes();

    formatEmbeddedContent();

    // Start or stop embedded content depending on global appState.config
    if (appState.config.autoPlayMedia === false) {
      stopEmbeddedContent(appState.currentSlide, { unloadIframes: false });
    } else {
      startEmbeddedContent(appState.currentSlide);
    }

    if (isOverview()) {
      layoutOverview();
    }

  }

  /**
  * Resets all vertical slides so that only the first
  * is visible.
  */
  function resetVerticalSlides() {

    const horizontalSlides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));
    horizontalSlides.forEach( (horizontalSlide) => {

      const verticalSlides = toArray(horizontalSlide.querySelectorAll('section' ));
      verticalSlides.forEach( (verticalSlide, y) => {

        if (y > 0) {
          verticalSlide.classList.remove('present');
          verticalSlide.classList.remove('past');
          verticalSlide.classList.add('future');
          verticalSlide.setAttribute('aria-hidden', 'true');
        }

      });

    });

  }

  /**
  * Sorts and formats all of fragments in the
  * presentation.
  */
  function sortAllFragments() {

    const horizontalSlides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));
    horizontalSlides.forEach( (horizontalSlide) => {

      const verticalSlides = toArray(horizontalSlide.querySelectorAll('section' ));
      verticalSlides.forEach( (verticalSlide) => {

        sortFragments(verticalSlide.querySelectorAll('.fragment' ));

      });

      if (verticalSlides.length === 0 ) sortFragments(horizontalSlide.querySelectorAll('.fragment' ));

    });

  }

  /**
  * Randomly shuffles all slides in the deck.
  */
  function shuffle() {

    const slides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));

    slides.forEach( (slide) => {

      // Insert this slide next to another random slide. This may
      // cause the slide to insert before itself but that's fine.
      appState.dom.slides.insertBefore(slide, slides[ Math.floor(Math.random() * slides.length ) ]);

    });

  }

  /**
  * Updates one dimension of slides by showing the slide
  * with the specified index.
  *
  * @param {string} selector A CSS selector that will fetch
  * the group of slides we are working with
  * @param {number} index The index of the slide that should be
  * shown
  *
  * @return {number} The index of the slide that is now shown,
  * might differ from the passed in index if it was out of
  * bounds.
  */
  function updateSlides(selector, index) {

    // Select all slides and convert the NodeList result to
    // an array
    const slides = toArray(appState.dom.wrapper.querySelectorAll(selector ) );
    const slidesLength = slides.length;

    const printMode = isPrintingPDF();

    if (slidesLength) {

      // Should the index loop?
      if (appState.config.loop) {
        index %= slidesLength;

        if (index < 0) {
          index = slidesLength + index;
        }
      }

      // Enforce max and minimum index bounds
      index = Math.max(Math.min(index, slidesLength - 1 ), 0);

      for (let i = 0; i < slidesLength; i++) {
        const element = slides[i];

        const reverse = appState.config.rtl && !isVerticalSlide(element);

        element.classList.remove('past');
        element.classList.remove('present');
        element.classList.remove('future');

        // http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');

        // If this element contains vertical slides
        if (element.querySelector('section' )) {
          element.classList.add('stack');
        }

        // If we're printing static slides, all slides are "present"
        if (printMode) {
          element.classList.add('present');
          continue;
        }

        if (i < index) {
          // Any element previous to index is given the 'past' class
          element.classList.add(reverse ? 'future' : 'past');

          if (appState.config.fragments) {
            const pastFragments = toArray(element.querySelectorAll('.fragment' ));

            // Show all fragments on prior slides
            while(pastFragments.length) {
              const pastFragment = pastFragments.pop();
              pastFragment.classList.add('visible');
              pastFragment.classList.remove('current-fragment');
            }
          }
        } else if (i > index) {
          // Any element subsequent to index is given the 'future' class
          element.classList.add(reverse ? 'past' : 'future');

          if (appState.config.fragments) {
            const futureFragments = toArray(element.querySelectorAll('.fragment.visible' ));

            // No fragments in future slides should be visible ahead of time
            while(futureFragments.length) {
              const futureFragment = futureFragments.pop();
              futureFragment.classList.remove('visible');
              futureFragment.classList.remove('current-fragment');
            }
          }
        }
      }

      // Mark the current slide as present
      slides[index].classList.add('present');
      slides[index].removeAttribute('hidden');
      slides[index].removeAttribute('aria-hidden');

      // If this slide has a state associated with it, add it
      // onto the current state of the deck
      const slideState = slides[index].getAttribute('data-state');
      if (slideState) {
        appState.state = appState.state.concat(slideState.split(' ' ));
      }

    } else {
      // Since there are no slides we can't be anywhere beyond the
      // zeroth index
      index = 0;
    }

    return index;

  }

  /**
  * Optimization method; hide all slides that are far away
  * from the present slide.
  */
  function updateSlidesVisibility() {

    // Select all slides and convert the NodeList result to
    // an array
    const horizontalSlides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));
    const horizontalSlidesLength = horizontalSlides.length;
    let distanceX;
    let distanceY;

    if (horizontalSlidesLength && typeof appState.indexh !== 'undefined') {

      // The number of steps away from the present slide that will
      // be visible
      let viewDistance = isOverview() ? 10 : appState.config.viewDistance;

      // Limit view distance on weaker devices
      if (appState.features.isMobileDevice) {
        viewDistance = isOverview() ? 6 : 2;
      }

      // All slides need to be visible when exporting to PDF
      if (isPrintingPDF()) {
        viewDistance = Number.MAX_VALUE;
      }

      for (let x = 0; x < horizontalSlidesLength; x++) {
        const horizontalSlide = horizontalSlides[x];

        const verticalSlides = toArray(horizontalSlide.querySelectorAll('section' ) );
        const verticalSlidesLength = verticalSlides.length;

        // Determine how far away this slide is from the present
        distanceX = Math.abs((appState.indexh || 0 ) - x ) || 0;

        // If the presentation is looped, distance should measure
        // 1 between the first and last slides
        if (appState.config.loop) {
          distanceX = Math.abs(((appState.indexh || 0 ) - x ) % (horizontalSlidesLength - viewDistance ) ) || 0;
        }

        // Show the horizontal slide if it's within the view distance
        if (distanceX < viewDistance) {
          loadSlide(horizontalSlide);
        } else {
          unloadSlide(horizontalSlide);
        }

        if (verticalSlidesLength) {

          const oy = getPreviousVerticalIndex(horizontalSlide);

          for (let y = 0; y < verticalSlidesLength; y++) {
            const verticalSlide = verticalSlides[y];

            distanceY = x === (appState.indexh || 0 ) ? Math.abs((appState.indexv || 0 ) - y ) : Math.abs(y - oy);

            if (distanceX + distanceY < viewDistance) {
              loadSlide(verticalSlide);
            } else {
              unloadSlide(verticalSlide);
            }
          }

        }
      }

      // Flag if there are ANY vertical slides, anywhere in the deck
      if (appState.dom.wrapper.querySelectorAll('.slides>section>section' ).length) {
        appState.dom.wrapper.classList.add('has-vertical-slides');
      } else {
        appState.dom.wrapper.classList.remove('has-vertical-slides');
      }

      // Flag if there are ANY horizontal slides, anywhere in the deck
      if (appState.dom.wrapper.querySelectorAll('.slides>section' ).length > 1) {
        appState.dom.wrapper.classList.add('has-horizontal-slides');
      } else {
        appState.dom.wrapper.classList.remove('has-horizontal-slides');
      }

    }

  }

  /**
  * Pick up notes from the current slide and display them
  * to the viewer.
  *
  * @see {@link appState.config.showNotes}
  */
  function updateNotes() {

    if (appState.config.showNotes && appState.dom.speakerNotes && appState.currentSlide && !isPrintingPDF()) {

      appState.dom.speakerNotes.innerHTML = getSlideNotes() || '<span class="notes-placeholder">No notes on this slide.</span>';

    }

  }

  /**
  * Updates the visibility of the speaker notes sidebar that
  * is used to share annotated slides. The notes sidebar is
  * only visible if showNotes is true and there are notes on
  * one or more slides in the deck.
  */
  function updateNotesVisibility() {

    if (appState.config.showNotes && hasNotes()) {
      appState.dom.wrapper.classList.add('show-notes');
    } else {
      appState.dom.wrapper.classList.remove('show-notes');
    }

  }

  /**
  * Checks if there are speaker notes for ANY slide in the
  * presentation.
  */
  function hasNotes() {

    return appState.dom.slides.querySelectorAll('[data-notes], aside.notes' ).length > 0;

  }

  /**
  * Updates the progress bar to reflect the current slide.
  */
  function updateProgress() {

    // Update progress if enabled
    if (appState.config.progress && appState.dom.progressbar) {

      appState.dom.progressbar.style.width = getProgress() * appState.dom.wrapper.offsetWidth + 'px';

    }

  }

  /**
  * Updates the slide number div to reflect the current slide.
  *
  * The following slide number formats are available:
  *  "h.v":  horizontal . vertical slide number (default)
  *  "h/v":  horizontal / vertical slide number
  *    "c":  flattened slide number
  *  "c/t":  flattened slide number / total slides
  */
  function updateSlideNumber() {

    // Update slide number if enabled
    if (appState.config.slideNumber && appState.dom.slideNumber) {

      const value = [];
      let format = 'h.v';

      // Check if a custom number format is available
      if (typeof appState.config.slideNumber === 'string') {
        format = appState.config.slideNumber;
      }

      switch(format) {
        case 'c':
        value.push(getSlidePastCount() + 1);
        break;
        case 'c/t':
        value.push(getSlidePastCount() + 1, '/', getTotalSlides());
        break;
        case 'h/v':
        value.push(appState.indexh + 1);
        if (isVerticalSlide() ) value.push('/', appState.indexv + 1);
        break;
        default:
        value.push(appState.indexh + 1);
        if (isVerticalSlide() ) value.push('.', appState.indexv + 1);
      }

      appState.dom.slideNumber.innerHTML = formatSlideNumber(value[0], value[1], value[2]);
    }

  }

  /**
  * Applies HTML formatting to a slide number before it's
  * written to the DOM.
  *
  * @param {number} a Current slide
  * @param {string} delimiter Character to separate slide numbers
  * @param {(number|*)} b Total slides
  * @return {string} HTML string fragment
  */
  function formatSlideNumber(a, delimiter, b) {

    if (typeof b === 'number' && !isNaN(b )) {
      return  '<span class="slide-number-a">'+ a +'</span>' +
      '<span class="slide-number-delimiter">'+ delimiter +'</span>' +
      '<span class="slide-number-b">'+ b +'</span>';
    } else {
      return '<span class="slide-number-a">'+ a +'</span>';
    }

  }

  /**
  * Updates the state of all control/navigation arrows.
  */
  function updateControls() {

    const routes = availableRoutes();
    const fragments = availableFragments();

    // Remove the 'enabled' class from all directions
    appState.dom.controlsLeft.concat(appState.dom.controlsRight )
      .concat(appState.dom.controlsUp )
      .concat(appState.dom.controlsDown )
      .concat(appState.dom.controlsPrev )
      .concat(appState.dom.controlsNext ).forEach( (node) => {
        node.classList.remove('enabled');
        node.classList.remove('fragmented');

        // Set 'disabled' attribute on all directions
        node.setAttribute('disabled', 'disabled');
      });

    // Add the 'enabled' class to the available routes; remove 'disabled' attribute to enable buttons
    if (routes.left ) {
      appState.dom.controlsLeft.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }
    if (routes.right ) {
      appState.dom.controlsRight.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }
    if (routes.up ) {
      appState.dom.controlsUp.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }
    if (routes.down ) {
      appState.dom.controlsDown.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }

    // Prev/next buttons
    if (routes.left || routes.up ) {
      appState.dom.controlsPrev.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }
    if (routes.right || routes.down ) {
      appState.dom.controlsNext.forEach( (el) => {
        el.classList.add('enabled');
        el.removeAttribute('disabled');
      });
    }

    // Highlight fragment directions
    if (appState.currentSlide) {

      // Always apply fragment decorator to prev/next buttons
      if (fragments.prev ) {
        appState.dom.controlsPrev.forEach( (el) => {
          el.classList.add('fragmented', 'enabled');
          el.removeAttribute('disabled');
        });
      }
      if (fragments.next ) {
        appState.dom.controlsNext.forEach( (el) => {
          el.classList.add('fragmented', 'enabled');
          el.removeAttribute('disabled');
        });
      }

      // Apply fragment decorators to directional buttons based on
      // what slide axis they are in
      if (isVerticalSlide(appState.currentSlide )) {
        if (fragments.prev ) {
          appState.dom.controlsUp.forEach( (el) => {
            el.classList.add('fragmented', 'enabled');
            el.removeAttribute('disabled');
          });
        }
        if (fragments.next ) {
          appState.dom.controlsDown.forEach( (el) => {
            el.classList.add('fragmented', 'enabled');
            el.removeAttribute('disabled');
          });
        }
      } else {
        if (fragments.prev ) {
          appState.dom.controlsLeft.forEach( (el) => {
            el.classList.add('fragmented', 'enabled');
            el.removeAttribute('disabled');
          });
        }
        if (fragments.next ) {
          appState.dom.controlsRight.forEach( (el) => {
            el.classList.add('fragmented', 'enabled');
            el.removeAttribute('disabled');
          });
        }
      }

    }

    if (appState.config.controlsTutorial) {

      // Highlight control arrows with an animation to ensure
      // that the viewer knows how to navigate
      if (!appState.hasNavigatedDown && routes.down) {
        appState.dom.controlsDownArrow.classList.add('highlight');
      } else {
        appState.dom.controlsDownArrow.classList.remove('highlight');

        if (!appState.hasNavigatedRight && routes.right && appState.indexv === 0) {
          appState.dom.controlsRightArrow.classList.add('highlight');
        } else {
          appState.dom.controlsRightArrow.classList.remove('highlight');
        }
      }

    }

  }

  /**
  * Updates the background elements to reflect the current
  * slide.
  *
  * @param {boolean} includeAll If true, the backgrounds of
  * all vertical slides (not just the present) will be updated.
  */
  function updateBackground(includeAll) {

    let currentBackground = null;

    // Reverse past/future classes when in RTL mode
    const horizontalPast = appState.config.rtl ? 'future' : 'past';
    const horizontalFuture = appState.config.rtl ? 'past' : 'future';

    // Update the classes of all backgrounds to match the
    // states of their slides (past/present/future)
    toArray(appState.dom.background.childNodes ).forEach( (backgroundh, h) => {

      backgroundh.classList.remove('past');
      backgroundh.classList.remove('present');
      backgroundh.classList.remove('future');

      if (h < appState.indexh) {
        backgroundh.classList.add(horizontalPast);
      } else if (h > appState.indexh) {
        backgroundh.classList.add(horizontalFuture);
      } else {
        backgroundh.classList.add('present');

        // Store a reference to the current background element
        currentBackground = backgroundh;
      }

      if (includeAll || h === appState.indexh) {
        toArray(backgroundh.querySelectorAll('.slide-background' ) ).forEach( (backgroundv, v) => {

          backgroundv.classList.remove('past');
          backgroundv.classList.remove('present');
          backgroundv.classList.remove('future');

          if (v < appState.indexv) {
            backgroundv.classList.add('past');
          } else if (v > appState.indexv) {
            backgroundv.classList.add('future');
          } else {
            backgroundv.classList.add('present');

            // Only if this is the present horizontal and vertical slide
            if (h === appState.indexh ) currentBackground = backgroundv;
          }

        });
      }

    });

    // Stop content inside of previous backgrounds
    if (appState.previousBackground) {

      stopEmbeddedContent(appState.previousBackground);

    }

    // Start content in the current background
    if (currentBackground) {

      startEmbeddedContent(currentBackground);

      const backgroundImageURL = currentBackground.style.backgroundImage || '';

      // Restart GIFs (doesn't work in Firefox)
      if (/\.gif/i.test(backgroundImageURL )) {
        currentBackground.style.backgroundImage = '';
        window.getComputedStyle(currentBackground).opacity;
        currentBackground.style.backgroundImage = backgroundImageURL;
      }

      // Don't transition between identical backgrounds. This
      // prevents unwanted flicker.
      const previousBackgroundHash = appState.previousBackground ? appState.previousBackground.getAttribute('data-background-hash' ) : null;
      const currentBackgroundHash = currentBackground.getAttribute('data-background-hash');
      if (currentBackgroundHash && currentBackgroundHash === previousBackgroundHash && currentBackground !== appState.previousBackground) {
        appState.dom.background.classList.add('no-transition');
      }

      appState.previousBackground = currentBackground;

    }

    // If there's a background brightness flag for this slide,
    // bubble it to the .reveal container
    if (appState.currentSlide) {
      [ 'has-light-background', 'has-dark-background' ].forEach( (classToBubble) => {
        if (appState.currentSlide.classList.contains(classToBubble )) {
          appState.dom.wrapper.classList.add(classToBubble);
        } else {
          appState.dom.wrapper.classList.remove(classToBubble);
        }
      });
    }

    // Allow the first background to apply without transition
    setTimeout( () => {
      appState.dom.background.classList.remove('no-transition');
    }, 1);

  }

  /**
  * Updates the position of the parallax background based
  * on the current slide index.
  */
  function updateParallax() {

    if (appState.config.parallaxBackgroundImage) {

      const horizontalSlides = appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ),
      verticalSlides = appState.dom.wrapper.querySelectorAll(VERTICAL_SLIDES_SELECTOR);

      const backgroundSize = appState.dom.background.style.backgroundSize.split(' ');
      let backgroundWidth;
      let backgroundHeight;

      if (backgroundSize.length === 1) {
        backgroundWidth = backgroundHeight = parseInt(backgroundSize[0], 10);
      } else {
        backgroundWidth = parseInt(backgroundSize[0], 10);
        backgroundHeight = parseInt(backgroundSize[1], 10);
      }

      const slideWidth = appState.dom.background.offsetWidth;
      const horizontalSlideCount = horizontalSlides.length;
      let horizontalOffsetMultiplier;

      if (typeof appState.config.parallaxBackgroundHorizontal === 'number') {
        horizontalOffsetMultiplier = appState.config.parallaxBackgroundHorizontal;
      } else {
        horizontalOffsetMultiplier = horizontalSlideCount > 1 ? (backgroundWidth - slideWidth ) / (horizontalSlideCount-1 ) : 0;
      }

      const horizontalOffset = horizontalOffsetMultiplier * appState.indexh * -1;

      const slideHeight = appState.dom.background.offsetHeight;
      const verticalSlideCount = verticalSlides.length;
      let verticalOffsetMultiplier;

      if (typeof appState.config.parallaxBackgroundVertical === 'number') {
        verticalOffsetMultiplier = appState.config.parallaxBackgroundVertical;
      } else {
        verticalOffsetMultiplier = (backgroundHeight - slideHeight ) / (verticalSlideCount-1);
      }

      const verticalOffset = verticalSlideCount > 0 ?  verticalOffsetMultiplier * appState.indexv : 0;

      appState.dom.background.style.backgroundPosition = horizontalOffset + 'px ' + -verticalOffset + 'px';

    }

  }

  /**
  * Called when the given slide is within the configured view
  * distance. Shows the slide element and loads any content
  * that is set to load lazily (data-src).
  *
  * @param {HTMLElement} slide Slide to show
  */
  function loadSlide(slide, options) {

    options = options || {};

    // Show the slide element
    slide.style.display = appState.config.display;

    // Media elements with data-src attributes
    toArray(slide.querySelectorAll('img[data-src], video[data-src], audio[data-src]' ) ).forEach( (element) => {
      element.setAttribute('src', element.getAttribute('data-src' ));
      element.setAttribute('data-lazy-loaded', '');
      element.removeAttribute('data-src');
    });

    // Media elements with <source> children
    toArray(slide.querySelectorAll('video, audio' ) ).forEach( (media) => {
      let sources = 0;

      toArray(media.querySelectorAll('source[data-src]' ) ).forEach( (source) => {
        source.setAttribute('src', source.getAttribute('data-src' ));
        source.removeAttribute('data-src');
        source.setAttribute('data-lazy-loaded', '');
        sources += 1;
      });

      // If we rewrote sources for this video/audio element, we need
      // to manually tell it to load from its new origin
      if (sources > 0) {
        media.load();
      }
    });


    // Show the corresponding background element
    const indices = getIndices(slide);
    const background = getSlideBackground(indices.h, indices.v);
    if (background) {
      background.style.display = 'block';

      // If the background contains media, load it
      if (background.hasAttribute('data-loaded' ) === false) {
        background.setAttribute('data-loaded', 'true');

        const backgroundImage = slide.getAttribute('data-background-image' ),
        backgroundVideo = slide.getAttribute('data-background-video' ),
        backgroundVideoLoop = slide.hasAttribute('data-background-video-loop' ),
        backgroundVideoMuted = slide.hasAttribute('data-background-video-muted' ),
        backgroundIframe = slide.getAttribute('data-background-iframe');

        // Images
        if (backgroundImage) {
          background.style.backgroundImage = 'url('+ backgroundImage +')';
        } else if (backgroundVideo && !isSpeakerNotes()) {
          // Videos
          const video = document.createElement('video');

          if (backgroundVideoLoop) {
            video.setAttribute('loop', '');
          }

          if (backgroundVideoMuted) {
            video.muted = true;
          }

          // Inline video playback works (at least in Mobile Safari) as
          // long as the video is muted and the `playsinline` attribute is
          // present
          if (appState.features.isMobileDevice) {
            video.muted = true;
            video.autoplay = true;
            video.setAttribute('playsinline', '');
          }

          // Support comma separated lists of video sources
          backgroundVideo.split(',' ).forEach( (source) => {
            video.innerHTML += '<source src="'+ source +'">';
          });

          background.appendChild(video);
        } else if (backgroundIframe && options.excludeIframes !== true) {
          // Iframes
          const iframe = document.createElement('iframe');
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('mozallowfullscreen', '');
          iframe.setAttribute('webkitallowfullscreen', '');

          // Only load autoplaying content when the slide is shown to
          // avoid having it play in the background
          if (/autoplay=(1|true|yes)/gi.test(backgroundIframe )) {
            iframe.setAttribute('data-src', backgroundIframe);
          } else {
            iframe.setAttribute('src', backgroundIframe);
          }

          iframe.style.width  = '100%';
          iframe.style.height = '100%';
          iframe.style.maxHeight = '100%';
          iframe.style.maxWidth = '100%';

          background.appendChild(iframe);
        }
      }

    }

  }

  /**
  * Unloads and hides the given slide. This is called when the
  * slide is moved outside of the configured view distance.
  *
  * @param {HTMLElement} slide
  */
  function unloadSlide(slide) {

    // Hide the slide element
    slide.style.display = 'none';

    // Hide the corresponding background element
    const indices = getIndices(slide);
    const background = getSlideBackground(indices.h, indices.v);
    if (background) {
      background.style.display = 'none';
    }

    // Reset lazy-loaded media elements with src attributes
    toArray(slide.querySelectorAll('video[data-lazy-loaded][src], audio[data-lazy-loaded][src]' ) ).forEach( (element) => {
      element.setAttribute('data-src', element.getAttribute('src' ));
      element.removeAttribute('src');
    });

    // Reset lazy-loaded media elements with <source> children
    toArray(slide.querySelectorAll('video[data-lazy-loaded] source[src], audio source[src]' ) ).forEach( (source) => {
      source.setAttribute('data-src', source.getAttribute('src' ));
      source.removeAttribute('src');
    });

  }

  /**
  * Determine what available routes there are for navigation.
  *
  * @return {{left: boolean, right: boolean, up: boolean, down: boolean}}
  */
  function availableRoutes() {

    const horizontalSlides = appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR );
    const verticalSlides = appState.dom.wrapper.querySelectorAll(VERTICAL_SLIDES_SELECTOR);

    const routes = {
      left: appState.indexh > 0 || appState.config.loop,
      right: appState.indexh < horizontalSlides.length - 1 || appState.config.loop,
      up: appState.indexv > 0,
      down: appState.indexv < verticalSlides.length - 1
    };

    // reverse horizontal controls for rtl
    if (appState.config.rtl) {
      const left = routes.left;
      routes.left = routes.right;
      routes.right = left;
    }

    return routes;

  }

  /**
  * Returns an object describing the available fragment
  * directions.
  *
  * @return {{prev: boolean, next: boolean}}
  */
  function availableFragments() {

    if (appState.currentSlide && appState.config.fragments) {
      const fragments = appState.currentSlide.querySelectorAll('.fragment');
      const hiddenFragments = appState.currentSlide.querySelectorAll('.fragment:not(.visible)');

      return {
        prev: fragments.length - hiddenFragments.length > 0,
        next: !!hiddenFragments.length
      };
    } else {
      return { prev: false, next: false };
    }

  }

  /**
  * Enforces origin-specific format rules for embedded media.
  */
  function formatEmbeddedContent() {

    const _appendParamToIframeSource = function (sourceAttribute, sourceURL, param) {
      toArray(appState.dom.slides.querySelectorAll('iframe['+ sourceAttribute +'*="'+ sourceURL +'"]' ) ).forEach( (el) => {
        const src = el.getAttribute(sourceAttribute);
        if (src && src.indexOf(param ) === -1) {
          el.setAttribute(sourceAttribute, src + (!/\?/.test(src ) ? '?' : '&' ) + param);
        }
      });
    };

    // YouTube frames must include "?enablejsapi=1"
    _appendParamToIframeSource('src', 'youtube.com/embed/', 'enablejsapi=1');
    _appendParamToIframeSource('data-src', 'youtube.com/embed/', 'enablejsapi=1');

    // Vimeo frames must include "?api=1"
    _appendParamToIframeSource('src', 'player.vimeo.com/', 'api=1');
    _appendParamToIframeSource('data-src', 'player.vimeo.com/', 'api=1');

    // Always show media controls on mobile devices
    if (appState.features.isMobileDevice) {
      toArray(appState.dom.slides.querySelectorAll('video, audio' ) ).forEach( (el) => {
        el.controls = true;
      });
    }

  }

  /**
  * Start playback of any embedded content inside of
  * the given element.
  *
  * @param {HTMLElement} element
  */
  function startEmbeddedContent(element) {

    if (element && !isSpeakerNotes()) {

      // Restart GIFs
      toArray(element.querySelectorAll('img[src$=".gif"]' ) ).forEach( (el) => {
        // Setting the same unchanged source like this was confirmed
        // to work in Chrome, FF & Safari
        el.setAttribute('src', el.getAttribute('src' ));
      });

      // HTML5 media elements
      toArray(element.querySelectorAll('video, audio' ) ).forEach( (el) => {
        if (closestParent(el, '.fragment' ) && !closestParent(el, '.fragment.visible' )) {
          return;
        }

        // Prefer an explicit global autoplay setting
        let autoplay = appState.config.autoPlayMedia;

        // If no global setting is available, fall back on the element's
        // own autoplay setting
        if (typeof autoplay !== 'boolean') {
          autoplay = el.hasAttribute('data-autoplay' ) || !!closestParent(el, '.slide-background');
        }

        if (autoplay && typeof el.play === 'function') {

          if (el.readyState > 1) {
            startEmbeddedMedia({ target: el });
          } else {
            el.removeEventListener('loadeddata', startEmbeddedMedia); // remove first to avoid dupes
            el.addEventListener('loadeddata', startEmbeddedMedia);
          }

        }
      });

      // Normal iframes
      toArray(element.querySelectorAll('iframe[src]' ) ).forEach( (el) => {
        if (closestParent(el, '.fragment' ) && !closestParent(el, '.fragment.visible' )) {
          return;
        }

        startEmbeddedIframe({ target: el });
      });

      // Lazy loading iframes
      toArray(element.querySelectorAll('iframe[data-src]' ) ).forEach( (el) => {
        if (closestParent(el, '.fragment' ) && !closestParent(el, '.fragment.visible' )) {
          return;
        }

        if (el.getAttribute('src' ) !== el.getAttribute('data-src' )) {
          el.removeEventListener('load', startEmbeddedIframe); // remove first to avoid dupes
          el.addEventListener('load', startEmbeddedIframe);
          el.setAttribute('src', el.getAttribute('data-src' ));
        }
      });

    }

  }

  /**
  * Starts playing an embedded video/audio element after
  * it has finished loading.
  *
  * @param {object} event
  */
  function startEmbeddedMedia(event) {

    const isAttachedToDOM = !!closestParent(event.target, 'html' ),
    isVisible      = !!closestParent(event.target, '.present');

    if (isAttachedToDOM && isVisible) {
      event.target.currentTime = 0;
      event.target.play();
    }

    event.target.removeEventListener('loadeddata', startEmbeddedMedia);

  }

  /**
  * "Starts" the content of an embedded iframe using the
  * postMessage API.
  *
  * @param {object} event
  */
  function startEmbeddedIframe(event) {

    const iframe = event.target;

    if (iframe && iframe.contentWindow) {

      const isAttachedToDOM = !!closestParent(event.target, 'html' ),
      isVisible      = !!closestParent(event.target, '.present');

      if (isAttachedToDOM && isVisible) {

        // Prefer an explicit global autoplay setting
        let autoplay = appState.config.autoPlayMedia;

        // If no global setting is available, fall back on the element's
        // own autoplay setting
        if (typeof autoplay !== 'boolean') {
          autoplay = iframe.hasAttribute('data-autoplay' ) || !!closestParent(iframe, '.slide-background');
        }

        // YouTube postMessage API
        if (/youtube\.com\/embed\//.test(iframe.getAttribute('src' ) ) && autoplay) {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else if (/player\.vimeo\.com\//.test(iframe.getAttribute('src' ) ) && autoplay) {
          // Vimeo postMessage API
          iframe.contentWindow.postMessage('{"method":"play"}', '*');
        } else {
          // Generic postMessage API
          iframe.contentWindow.postMessage('slide:start', '*');
        }

      }

    }

  }

  /**
  * Stop playback of any embedded content inside of
  * the targeted slide.
  *
  * @param {HTMLElement} element
  */
  function stopEmbeddedContent(element, options) {

    options = Object.assign({
      // Defaults
      unloadIframes: true
    }, options || {});

    if (element && element.parentNode) {
      // HTML5 media elements
      toArray(element.querySelectorAll('video, audio' ) ).forEach( (el) => {
        if (!el.hasAttribute('data-ignore' ) && typeof el.pause === 'function') {
          el.setAttribute('data-paused-by-reveal', '');
          el.pause();
        }
      });

      // Generic postMessage API for non-lazy loaded iframes
      toArray(element.querySelectorAll('iframe' ) ).forEach( (el) => {
        if (el.contentWindow ) el.contentWindow.postMessage('slide:stop', '*');
        el.removeEventListener('load', startEmbeddedIframe);
      });

      // YouTube postMessage API
      toArray(element.querySelectorAll('iframe[src*="youtube.com/embed/"]' ) ).forEach( (el) => {
        if (!el.hasAttribute('data-ignore' ) && el.contentWindow && typeof el.contentWindow.postMessage === 'function') {
          el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
      });

      // Vimeo postMessage API
      toArray(element.querySelectorAll('iframe[src*="player.vimeo.com/"]' ) ).forEach( (el) => {
        if (!el.hasAttribute('data-ignore' ) && el.contentWindow && typeof el.contentWindow.postMessage === 'function') {
          el.contentWindow.postMessage('{"method":"pause"}', '*');
        }
      });

      if (options.unloadIframes === true) {
        // Unload lazy-loaded iframes
        toArray(element.querySelectorAll('iframe[data-src]' ) ).forEach( (el) => {
          // Only removing the src doesn't actually unload the frame
          // in all browsers (Firefox) so we set it to blank first
          el.setAttribute('src', 'about:blank');
          el.removeAttribute('src');
        });
      }
    }

  }

  /**
  * Returns the number of past slides. This can be used as a global
  * flattened index for slides.
  *
  * @return {number} Past slide count
  */
  function getSlidePastCount() {

    const horizontalSlides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));

    // The number of past slides
    let pastCount = 0;

    // Step through all slides and count the past ones
    for (let i = 0; i < horizontalSlides.length; i++) {

      const horizontalSlide = horizontalSlides[i];
      const verticalSlides = toArray(horizontalSlide.querySelectorAll('section' ));

      for (let j = 0; j < verticalSlides.length; j++) {

        // Stop as soon as we arrive at the present
        if (verticalSlides[j].classList.contains('present' )) {
          break;
        }

        pastCount++;

      }

      // Stop as soon as we arrive at the present
      if (horizontalSlide.classList.contains('present' )) {
        break;
      }

      // Don't count the wrapping section for vertical slides
      if (horizontalSlide.classList.contains('stack' ) === false) {
        pastCount++;
      }

    }

    return pastCount;

  }

  /**
  * Returns a value ranging from 0-1 that represents
  * how far into the presentation we have navigated.
  *
  * @return {number}
  */
  function getProgress() {

    // The number of past and total slides
    const totalCount = getTotalSlides();
    let pastCount = getSlidePastCount();

    if (appState.currentSlide) {

      const allFragments = appState.currentSlide.querySelectorAll('.fragment');

      // If there are fragments in the current slide those should be
      // accounted for in the progress.
      if (allFragments.length > 0) {
        const visibleFragments = appState.currentSlide.querySelectorAll('.fragment.visible');

        // This value represents how big a portion of the slide progress
        // that is made up by its fragments (0-1)
        const fragmentWeight = 0.9;

        // Add fragment progress to the past slide count
        pastCount += (visibleFragments.length / allFragments.length ) * fragmentWeight;
      }

    }

    return pastCount / (totalCount - 1);

  }

  /**
  * Checks if this presentation is running inside of the
  * speaker notes window.
  *
  * @return {boolean}
  */
  function isSpeakerNotes() {

    return !!window.location.search.match(/receiver/gi);

  }

  /**
  * Reads the current URL (hash) and navigates accordingly.
  */
  function readURL() {

    const hash = window.location.hash;

    // Attempt to parse the hash as either an index or name
    const bits = hash.slice(2 ).split('/' ),
    name = hash.replace(/#|\//gi, '');

    // If the first bit is invalid and there is a name we can
    // assume that this is a named link
    if (isNaN(parseInt(bits[0], 10 ) ) && name.length) {
      let element;

      // Ensure the named link is a valid HTML ID attribute
      if (/^[a-zA-Z][\w:.-]*$/.test(name )) {
        // Find the slide with the specified ID
        element = document.getElementById(name);
      }

      if (element) {
        // Find the position of the named slide and navigate to it
        const indices = Reveal.getIndices(element);
        navigateSlide(indices.h, indices.v);
      } else {
        // If the slide doesn't exist, navigate to the current slide
        navigateSlide(appState.indexh || 0, appState.indexv || 0);
      }
    } else {
      // Read the index components of the hash
      const h = parseInt(bits[0], 10 ) || 0;
      const v = parseInt(bits[1], 10 ) || 0;

      if (h !== appState.indexh || v !== appState.indexv) {
        navigateSlide(h, v);
      }
    }

  }

  /**
  * Updates the page URL (hash) to reflect the current
  * state.
  *
  * @param {number} delay The time in ms to wait before
  * writing the hash
  */
  function writeURL(delay) {

    if (appState.config.history) {

      // Make sure there's never more than one timeout running
      clearTimeout(appState.writeURLTimeout);

      // If a delay is specified, timeout this call
      if (typeof delay === 'number') {
        appState.writeURLTimeout = setTimeout(writeURL, delay);
      } else if (appState.currentSlide) {
        let url = '/';

        // Attempt to create a named link based on the slide's ID
        let id = appState.currentSlide.getAttribute('id');
        if (id) {
          id = id.replace(/[^a-zA-Z0-9\-_:.]/g, '');
        }

        // If the current slide has an ID, use that as a named link
        if (typeof id === 'string' && id.length) {
          url = '/' + id;
        } else {
          // Otherwise use the /h/v index
          if (appState.indexh > 0 || appState.indexv > 0 ) url += appState.indexh;
          if (appState.indexv > 0 ) url += '/' + appState.indexv;
        }

        window.location.hash = url;
      }
    }

  }
  /**
  * Retrieves the h/v location and fragment of the current,
  * or specified, slide.
  *
  * @param {HTMLElement} [slide] If specified, the returned
  * index will be for this slide rather than the currently
  * active one
  *
  * @return {{h: number, v: number, f: number}}
  */
  function getIndices(slide) {

    // By default, return the current indices
    let h = appState.indexh;
    let v = appState.indexv;
    let f;

    // If a slide is specified, return the indices of that slide
    if (slide) {
      const isVertical = isVerticalSlide(slide);
      const slideh = isVertical ? slide.parentNode : slide;

      // Select all horizontal slides
      const horizontalSlides = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ));

      // Now that we know which the horizontal slide is, get its index
      h = Math.max(horizontalSlides.indexOf(slideh ), 0);

      // Assume we're not vertical
      v = undefined;

      // If this is a vertical slide, grab the vertical index
      if (isVertical) {
        v = Math.max(toArray(slide.parentNode.querySelectorAll('section' ) ).indexOf(slide ), 0);
      }
    }

    if (!slide && appState.currentSlide) {
      const hasFragments = appState.currentSlide.querySelectorAll('.fragment' ).length > 0;
      if (hasFragments) {
        const currentFragment = appState.currentSlide.querySelector('.current-fragment');
        if (currentFragment && currentFragment.hasAttribute('data-fragment-index' )) {
          f = parseInt(currentFragment.getAttribute('data-fragment-index' ), 10);
        } else {
          f = appState.currentSlide.querySelectorAll('.fragment.visible' ).length - 1;
        }
      }
    }

    return { h: h, v: v, f: f };

  }

  /**
  * Retrieves all slides in this presentation.
  */
  function getSlides() {

    return toArray(appState.dom.wrapper.querySelectorAll(SLIDES_SELECTOR + ':not(.stack)' ));

  }

  /**
  * Retrieves the total number of slides in this presentation.
  *
  * @return {number}
  */
  function getTotalSlides() {

    return getSlides().length;

  }

  /**
  * Returns the slide element matching the specified index.
  *
  * @return {HTMLElement}
  */
  function getSlide(x, y) {

    const horizontalSlide = appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR )[ x ];
    const verticalSlides = horizontalSlide && horizontalSlide.querySelectorAll('section');

    if (verticalSlides && verticalSlides.length && typeof y === 'number') {
      return verticalSlides ? verticalSlides[ y ] : undefined;
    }

    return horizontalSlide;

  }

  /**
  * Returns the background element for the given slide.
  * All slides, even the ones with no background properties
  * defined, have a background element so as long as the
  * index is valid an element will be returned.
  *
  * @param {number} x Horizontal background index
  * @param {number} y Vertical background index
  * @return {(HTMLElement[]|*)}
  */
  function getSlideBackground(x, y) {

    const slide = getSlide(x, y);
    if (slide) {
      return slide.slideBackgroundElement;
    }

    return undefined;

  }

  /**
  * Retrieves the speaker notes from a slide. Notes can be
  * defined in two ways:
  * 1. As a data-notes attribute on the slide <section>
  * 2. As an <aside class="notes"> inside of the slide
  *
  * @param {HTMLElement} [slide=appState.currentSlide]
  * @return {(string|null)}
  */
  function getSlideNotes(slide) {

    // Default to the current slide
    slide = slide || appState.currentSlide;

    // Notes can be specified via the data-notes attribute...
    if (slide.hasAttribute('data-notes' )) {
      return slide.getAttribute('data-notes');
    }

    // ... or using an <aside class="notes"> element
    const notesElement = slide.querySelector('aside.notes');
    if (notesElement) {
      return notesElement.innerHTML;
    }

    return null;

  }

  /**
  * Retrieves the current state of the presentation as
  * an object. This state can then be restored at any
  * time.
  *
  * @return {{indexh: number, indexv: number, indexf: number, paused: boolean, overview: boolean}}
  */
  function getState() {

    const indices = getIndices();

    return {
      indexh: indices.h,
      indexv: indices.v,
      indexf: indices.f,
      paused: isPaused(),
      overview: isOverview()
    };

  }

  /**
  * Restores the presentation to the given state.
  *
  * @param {object} state As generated by getState()
  * @see {@link getState} generates the parameter `state`
  */
  function setState(state) {

    if (typeof state === 'object') {
      navigateSlide(deserialize(state.indexh ), deserialize(state.indexv ), deserialize(state.indexf ));

      const pausedFlag = deserialize(state.paused);
      const overviewFlag = deserialize(state.overview);

      if (typeof pausedFlag === 'boolean' && pausedFlag !== isPaused()) {
        togglePause(pausedFlag);
      }

      if (typeof overviewFlag === 'boolean' && overviewFlag !== isOverview()) {
        toggleOverview(overviewFlag);
      }
    }

  }

  /**
  * Return a sorted fragments list, ordered by an increasing
  * "data-fragment-index" attribute.
  *
  * Fragments will be revealed in the order that they are returned by
  * this function, so you can use the index attributes to control the
  * order of fragment appearance.
  *
  * To maintain a sensible default fragment order, fragments are presumed
  * to be passed in document order. This function adds a "fragment-index"
  * attribute to each node if such an attribute is not already present,
  * and sets that attribute to an integer value which is the position of
  * the fragment within the fragments list.
  *
  * @param {object[]|*} fragments
  * @return {object[]} sorted Sorted array of fragments
  */
  function sortFragments(fragments) {

    fragments = toArray(fragments);

    let ordered = [];
    const unordered = [];
    const sorted = [];

    // Group ordered and unordered elements
    fragments.forEach((fragment) => {
      if (fragment.hasAttribute('data-fragment-index' )) {
        const index = parseInt(fragment.getAttribute('data-fragment-index' ), 10);

        if (!ordered[index]) {
          ordered[index] = [];
        }

        ordered[index].push(fragment);
      } else {
        unordered.push([ fragment ]);
      }
    });

    // Append fragments without explicit indices in their
    // DOM order
    ordered = ordered.concat(unordered);

    // Manually count the index up per group to ensure there
    // are no gaps
    let index = 0;

    // Push all fragments in their sorted order to an array,
    // this flattens the groups
    ordered.forEach((group) => {
      group.forEach((fragment) => {
        sorted.push(fragment);
        fragment.setAttribute('data-fragment-index', index);
      });

      index ++;
    });

    return sorted;

  }

  /**
  * Navigate to the specified slide fragment.
  *
  * @param {?number} index The index of the fragment that
  * should be shown, -1 means all are invisible
  * @param {number} offset Integer offset to apply to the
  * fragment index
  *
  * @return {boolean} true if a change was made in any
  * fragments visibility as part of this call
  */
  function navigateFragment(index, offset) {

    if (appState.currentSlide && appState.config.fragments) {

      const fragments = sortFragments(appState.currentSlide.querySelectorAll('.fragment' ));
      if (fragments.length) {

        // If no index is specified, find the current
        if (typeof index !== 'number') {
          const lastVisibleFragment = sortFragments(appState.currentSlide.querySelectorAll('.fragment.visible' ) ).pop();

          if (lastVisibleFragment) {
            index = parseInt(lastVisibleFragment.getAttribute('data-fragment-index' ) || 0, 10);
          } else {
            index = -1;
          }
        }

        // If an offset is specified, apply it to the index
        if (typeof offset === 'number') {
          index += offset;
        }

        const fragmentsShown = [];
        const fragmentsHidden = [];

        toArray(fragments ).forEach((element, i ) => {

          if (element.hasAttribute('data-fragment-index' )) {
            i = parseInt(element.getAttribute('data-fragment-index' ), 10);
          }

          // Visible fragments
          if (i <= index) {
            if (!element.classList.contains('visible' ) ) fragmentsShown.push(element);
            element.classList.add('visible');
            element.classList.remove('current-fragment');

            // Announce the fragments one by one to the Screen Reader
            appState.dom.statusDiv.textContent = getStatusText(element);

            if (i === index) {
              element.classList.add('current-fragment');
              startEmbeddedContent(element);
            }
          } else {
            // Hidden fragments
            if (element.classList.contains('visible' ) ) fragmentsHidden.push(element);
            element.classList.remove('visible');
            element.classList.remove('current-fragment');
          }

        });

        if (fragmentsHidden.length) {
          dispatchEvent('fragmenthidden', { fragment: fragmentsHidden[0], fragments: fragmentsHidden });
        }

        if (fragmentsShown.length) {
          dispatchEvent('fragmentshown', { fragment: fragmentsShown[0], fragments: fragmentsShown });
        }

        updateControls();
        updateProgress();

        return !!(fragmentsShown.length || fragmentsHidden.length);

      }

    }

    return false;

  }

  /**
  * Navigate to the next slide fragment.
  *
  * @return {boolean} true if there was a next fragment,
  * false otherwise
  */
  function nextFragment() {

    return navigateFragment(null, 1);

  }

  /**
  * Navigate to the previous slide fragment.
  *
  * @return {boolean} true if there was a previous fragment,
  * false otherwise
  */
  function previousFragment() {

    return navigateFragment(null, -1);

  }

  /**
  * Cues a new automated slide if enabled in the appState.config.
  */
  function cueAutoSlide() {

    cancelAutoSlide();

    if (appState.currentSlide && appState.config.autoSlide !== false) {

      let fragment = appState.currentSlide.querySelector('.current-fragment');

      // When the slide first appears there is no "current" fragment so
      // we look for a data-autoslide timing on the first fragment
      if (!fragment ) fragment = appState.currentSlide.querySelector('.fragment');

      const fragmentAutoSlide = fragment ? fragment.getAttribute('data-autoslide' ) : null;
      const parentAutoSlide = appState.currentSlide.parentNode ? appState.currentSlide.parentNode.getAttribute('data-autoslide' ) : null;
      const slideAutoSlide = appState.currentSlide.getAttribute('data-autoslide');

      // Pick value in the following priority order:
      // 1. Current fragment's data-autoslide
      // 2. Current slide's data-autoslide
      // 3. Parent slide's data-autoslide
      // 4. Global autoSlide setting
      if (fragmentAutoSlide) {
        appState.autoSlide = parseInt(fragmentAutoSlide, 10);
      } else if (slideAutoSlide) {
        appState.autoSlide = parseInt(slideAutoSlide, 10);
      } else if (parentAutoSlide) {
        appState.autoSlide = parseInt(parentAutoSlide, 10);
      } else {
        appState.autoSlide = appState.config.autoSlide;
      }

      // If there are media elements with data-autoplay,
      // automatically set the autoSlide duration to the
      // length of that media. Not applicable if the slide
      // is divided up into fragments.
      // playbackRate is accounted for in the duration.
      if (appState.currentSlide.querySelectorAll('.fragment' ).length === 0) {
        toArray(appState.currentSlide.querySelectorAll('video, audio' ) ).forEach( (el) => {
          if (el.hasAttribute('data-autoplay' )) {
            if (appState.autoSlide && (el.duration * 1000 / el.playbackRate ) > appState.autoSlide) {
              appState.autoSlide = (el.duration * 1000 / el.playbackRate ) + 1000;
            }
          }
        });
      }

      // Cue the next auto-slide if:
      // - There is an autoSlide value
      // - Auto-sliding isn't paused by the user
      // - The presentation isn't paused
      // - The overview isn't active
      // - The presentation isn't over
      if (appState.autoSlide && !appState.autoSlidePaused && !isPaused() && !isOverview() && (!Reveal.isLastSlide() || availableFragments().next || appState.config.loop === true )) {
        appState.autoSlideTimeout = setTimeout( () => {
          typeof appState.config.autoSlideMethod === 'function' ? appState.config.autoSlideMethod() : navigateNext();
          cueAutoSlide();
        }, appState.autoSlide);
        appState.autoSlideStartTime = Date.now();
      }

      if (appState.autoSlidePlayer) {
        appState.autoSlidePlayer.setPlaying(appState.autoSlideTimeout !== -1);
      }

    }

  }

  /**
  * Cancels any ongoing request to auto-slide.
  */
  function cancelAutoSlide() {

    clearTimeout(appState.autoSlideTimeout);
    appState.autoSlideTimeout = -1;

  }

  function pauseAutoSlide() {

    if (appState.autoSlide && !appState.autoSlidePaused) {
      appState.autoSlidePaused = true;
      dispatchEvent('autoslidepaused');
      clearTimeout(appState.autoSlideTimeout);

      if (appState.autoSlidePlayer) {
        appState.autoSlidePlayer.setPlaying(false);
      }
    }

  }

  function resumeAutoSlide() {

    if (appState.autoSlide && appState.autoSlidePaused) {
      appState.autoSlidePaused = false;
      dispatchEvent('autoslideresumed');
      cueAutoSlide();
    }

  }

  function navigateLeft() {

    // Reverse for RTL
    if (appState.config.rtl) {
      if ((isOverview() || nextFragment() === false ) && availableRoutes().left) {
        navigateSlide(appState.indexh + 1);
      }
    } else if ((isOverview() || previousFragment() === false ) && availableRoutes().left) {
      // Normal navigation
      navigateSlide(appState.indexh - 1);
    }

  }

  function navigateRight() {

    appState.hasNavigatedRight = true;

    // Reverse for RTL
    if (appState.config.rtl) {
      if ((isOverview() || previousFragment() === false ) && availableRoutes().right) {
        navigateSlide(appState.indexh - 1);
      }
    } else if ((isOverview() || nextFragment() === false ) && availableRoutes().right) {
      // Normal navigation
      navigateSlide(appState.indexh + 1);
    }

  }

  function navigateUp() {

    // Prioritize hiding fragments
    if ((isOverview() || previousFragment() === false ) && availableRoutes().up) {
      navigateSlide(appState.indexh, appState.indexv - 1);
    }

  }

  function navigateDown() {

    hasNavigatedDown = true;

    // Prioritize revealing fragments
    if ((isOverview() || nextFragment() === false ) && availableRoutes().down) {
      navigateSlide(appState.indexh, appState.indexv + 1);
    }

  }

  /**
  * Navigates backwards, prioritized in the following order:
  * 1) Previous fragment
  * 2) Previous vertical slide
  * 3) Previous horizontal slide
  */
  function navigatePrev() {

    // Prioritize revealing fragments
    if (previousFragment() === false) {
      if (availableRoutes().up) {
        navigateUp();
      } else {
        // Fetch the previous horizontal slide, if there is one
        let previousSlide;

        if (appState.config.rtl) {
          previousSlide = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR + '.future' ) ).pop();
        } else {
          previousSlide = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR + '.past' ) ).pop();
        }

        if (previousSlide) {
          const v = (previousSlide.querySelectorAll('section' ).length - 1 ) || undefined;
          const h = appState.indexh - 1;
          navigateSlide(h, v);
        }
      }
    }

  }

  /**
  * The reverse of #navigatePrev().
  */
  function navigateNext() {

    appState.hasNavigatedRight = true;
    appState.hasNavigatedDown = true;

    // Prioritize revealing fragments
    if (nextFragment() === false) {
      if (availableRoutes().down) {
        navigateDown();
      } else if (appState.config.rtl) {
        navigateLeft();
      } else {
        navigateRight();
      }
    }

  }

  /**
  * Checks if the target element prevents the triggering of
  * swipe navigation.
  */
  function isSwipePrevented(target) {

    while(target && typeof target.hasAttribute === 'function') {
      if (target.hasAttribute('data-prevent-swipe' ) ) return true;
      target = target.parentNode;
    }

    return false;

  }


  // --------------------------------------------------------------------//
  // ----------------------------- EVENTS -------------------------------//
  // --------------------------------------------------------------------//

  /**
  * Called by all event handlers that are based on user
  * input.
  *
  * @param {object} [event]
  */
  function onUserInput() {

    if (appState.config.autoSlideStoppable) {
      pauseAutoSlide();
    }

  }

  /**
  * Handler for the document level 'keypress' event.
  *
  * @param {object} event
  */
  function onDocumentKeyPress(event) {

    // Check if the pressed key is question mark
    if (event.shiftKey && event.charCode === 63) {
      toggleHelp();
    }

  }

  /**
  * Handler for the document level 'keydown' event.
  *
  * @param {object} event
  */
  function onDocumentKeyDown(event) {

    // If there's a condition specified and it returns false,
    // ignore this event
    if (typeof appState.config.keyboardCondition === 'function' && appState.config.keyboardCondition() === false) {
      return true;
    }

    // Remember if auto-sliding was paused so we can toggle it
    const autoSlideWasPaused = appState.autoSlidePaused;

    onUserInput(event);

    // Check if there's a focused element that could be using
    // the keyboard
    const activeElementIsCE = document.activeElement && document.activeElement.contentEditable !== 'inherit';
    const activeElementIsInput = document.activeElement && document.activeElement.tagName && /input|textarea/i.test(document.activeElement.tagName);
    const activeElementIsNotes = document.activeElement && document.activeElement.className && /speaker-notes/i.test(document.activeElement.className);

    // Disregard the event if there's a focused element or a
    // keyboard modifier key is present
    if (activeElementIsCE || activeElementIsInput || activeElementIsNotes || (event.shiftKey && event.keyCode !== 32) || event.altKey || event.ctrlKey || event.metaKey ) return;

    // While paused only allow resume keyboard events; 'b', 'v', '.'
    const resumeKeyCodes = [66,86,190,191];
    let key;

    // Custom key bindings for togglePause should be able to resume
    if (typeof appState.config.keyboard === 'object') {
      for (key in appState.config.keyboard) {
        if (appState.config.keyboard[key] === 'togglePause') {
          resumeKeyCodes.push(parseInt(key, 10 ));
        }
      }
    }

    if (isPaused() && resumeKeyCodes.indexOf(event.keyCode ) === -1) {
      return false;
    }

    let triggered = false;

    // 1. User defined key bindings
    if (typeof appState.config.keyboard === 'object') {

      for (key in appState.config.keyboard) {

        // Check if this binding matches the pressed key
        if (parseInt(key, 10 ) === event.keyCode) {

          const value = appState.config.keyboard[ key ];

          // Callback function
          if (typeof value === 'function') {
            value.apply(null, [ event ]);
          } else if (typeof value === 'string' && typeof Reveal[ value ] === 'function') {
            // String shortcuts to reveal.js API
            Reveal[ value ].call();
          }

          triggered = true;

        }

      }

    }

    // 2. System defined key bindings
    if (triggered === false) {

      // Assume true and try to prove false
      triggered = true;

      switch(event.keyCode) {
        // p, page up
        case 80: case 33: navigatePrev(); break;
        // n, page down
        case 78: case 34: navigateNext(); break;
        // h, left
        case 72: case 37: navigateLeft(); break;
        // l, right
        case 76: case 39: navigateRight(); break;
        // k, up
        case 75: case 38: navigateUp(); break;
        // j, down
        case 74: case 40: navigateDown(); break;
        // home
        case 36: navigateSlide(0); break;
        // end
        case 35: navigateSlide(Number.MAX_VALUE); break;
        // space
        case 32: isOverview() ? deactivateOverview() : event.shiftKey ? navigatePrev() : navigateNext(); break;
        // return
        case 13: isOverview() ? deactivateOverview() : triggered = false; break;
        // two-spot, semicolon, b, v, period, Logitech presenter tools "black screen" button
        case 58: case 59: case 66: case 86: case 190: case 191: togglePause(); break;
        // f
        case 70: enterFullscreen(); break;
        // a
        case 65: if (appState.config.autoSlideStoppable ) toggleAutoSlide(autoSlideWasPaused); break;
        default:
        triggered = false;
      }

    }

    // If the input resulted in a triggered action we should prevent
    // the browsers default behavior
    if (triggered) {
      event.preventDefault();
    } else if ((event.keyCode === 27 || event.keyCode === 79 ) && appState.features.transforms3d) {
      // ESC or O key
      if (appState.dom.overlay) {
        closeOverlay();
      } else {
        toggleOverview();
      }

      event.preventDefault();
    }

    // If auto-sliding is enabled we need to cue up
    // another timeout
    cueAutoSlide();

  }

  /**
  * Handler for the 'touchstart' event, enables support for
  * swipe and pinch gestures.
  *
  * @param {object} event
  */
  function onTouchStart(event) {

    if (isSwipePrevented(event.target ) ) return true;

    touch.startX = event.touches[0].clientX;
    touch.startY = event.touches[0].clientY;
    touch.startCount = event.touches.length;

    // If there's two touches we need to memorize the distance
    // between those two points to detect pinching
    if (event.touches.length === 2 && appState.config.overview) {
      touch.startSpan = distanceBetween({
        x: event.touches[1].clientX,
        y: event.touches[1].clientY
      }, {
        x: touch.startX,
        y: touch.startY
      });
    }

  }

  /**
   * Handler for the 'touchmove' event.
   *
   * @param {object} event
   */
  function onTouchMove(event) {

    if (isSwipePrevented(event.target ) ) return true;

    // Each touch should only trigger one action
    if (!touch.captured) {
      onUserInput(event);

      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;

      // If the touch started with two points and still has
      // two active touches; test for the pinch gesture
      if (event.touches.length === 2 && touch.startCount === 2 && appState.config.overview) {

        // The current distance in pixels between the two touch points
        const currentSpan = distanceBetween({
          x: event.touches[1].clientX,
          y: event.touches[1].clientY
        }, {
          x: touch.startX,
          y: touch.startY
        });

        // If the span is larger than the desire amount we've got
        // ourselves a pinch
        if (Math.abs(touch.startSpan - currentSpan ) > touch.threshold) {
          touch.captured = true;

          if (currentSpan < touch.startSpan) {
            activateOverview();
          } else {
            deactivateOverview();
          }
        }

        event.preventDefault();

      } else if (event.touches.length === 1 && touch.startCount !== 2) {
        // There was only one touch point, look for a swipe

        const deltaX = currentX - touch.startX;
        const deltaY = currentY - touch.startY;

        if (deltaX > touch.threshold && Math.abs(deltaX ) > Math.abs(deltaY )) {
          touch.captured = true;
          navigateLeft();
        } else if (deltaX < -touch.threshold && Math.abs(deltaX ) > Math.abs(deltaY )) {
          touch.captured = true;
          navigateRight();
        } else if (deltaY > touch.threshold) {
          touch.captured = true;
          navigateUp();
        } else if (deltaY < -touch.threshold) {
          touch.captured = true;
          navigateDown();
        }

        // If we're embedded, only block touch events if they have
        // triggered an action
        if (appState.config.embedded) {
          if (touch.captured || isVerticalSlide(appState.currentSlide )) {
            event.preventDefault();
          }
        } else {
          // Not embedded? Block them all to avoid needless tossing
          // around of the viewport in iOS
          event.preventDefault();
        }

      }
    } else if(UA.match(/android/gi )) {
      // There's a bug with swiping on some Android devices unless
      // the default action is always prevented
      event.preventDefault();
    }

  }

  /**
  * Handler for the 'touchend' event.
  *
  * @param {object} event
  */
  function onTouchEnd() {

    touch.captured = false;

  }

  /**
  * Convert pointer down to touch start.
  *
  * @param {object} event
  */
  function onPointerDown(event) {

    if (event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch") {
      event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
      onTouchStart(event);
    }

  }

  /**
  * Convert pointer move to touch move.
  *
  * @param {object} event
  */
  function onPointerMove(event) {

    if (event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch" )  {
      event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
      onTouchMove(event);
    }

  }

  /**
  * Convert pointer up to touch end.
  *
  * @param {object} event
  */
  function onPointerUp(event) {

    if (event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === "touch" )  {
      event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
      onTouchEnd(event);
    }

  }

  /**
  * Handles mouse wheel scrolling, throttled to avoid skipping
  * multiple slides.
  *
  * @param {object} event
  */
  function onDocumentMouseScroll(event) {

    if (Date.now() - lastMouseWheelStep > 600) {

      lastMouseWheelStep = Date.now();

      const delta = event.detail || -event.wheelDelta;
      if (delta > 0) {
        navigateNext();
      } else if (delta < 0) {
        navigatePrev();
      }

    }

  }

  /**
  * Clicking on the progress bar results in a navigation to the
  * closest approximate horizontal slide using this equation:
  *
  * (clickX / presentationWidth ) * numberOfSlides
  *
  * @param {object} event
  */
  function onProgressClicked(event) {

    onUserInput(event);

    event.preventDefault();

    const slidesTotal = toArray(appState.dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR ) ).length;
    let slideIndex = Math.floor((event.clientX / appState.dom.wrapper.offsetWidth ) * slidesTotal);

    if (appState.config.rtl) {
      slideIndex = slidesTotal - slideIndex;
    }

    navigateSlide(slideIndex);

  }

  /**
  * Event handler for navigation control buttons.
  */
  function onNavigateLeftClicked(event) {
    event.preventDefault();
    onUserInput();
    navigateLeft();
  }
  function onNavigateRightClicked(event) {
    event.preventDefault();
    onUserInput();
    navigateRight();
  }
  function onNavigateUpClicked(event) {
    event.preventDefault();
    onUserInput();
    navigateUp();
  }
  function onNavigateDownClicked(event) {
    event.preventDefault();
    onUserInput();
    navigateDown();
  }
  function onNavigatePrevClicked(event) {
    event.preventDefault();
    onUserInput();
    navigatePrev();
  }
  function onNavigateNextClicked(event) {
    event.preventDefault();
    onUserInput();
    navigateNext();
  }

  /**
  * Handler for the window level 'hashchange' event.
  *
  * @param {object} [event]
  */
  function onWindowHashChange() {

    readURL();

  }

  /**
  * Handler for the window level 'resize' event.
  *
  * @param {object} [event]
  */
  function onWindowResize() {

    layout();

  }

  /**
  * Handle for the window level 'visibilitychange' event.
  *
  * @param {object} [event]
  */
  function onPageVisibilityChange() {

    const isHidden =  document.webkitHidden ||
    document.msHidden ||
    document.hidden;

    // If, after clicking a link or similar and we're coming back,
    // focus the document.body to ensure we can use keyboard shortcuts
    if (isHidden === false && document.activeElement !== document.body) {
      // Not all elements support .blur() - SVGs among them.
      if (typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      document.body.focus();
    }

  }

  /**
  * Invoked when a slide is and we're in the overview.
  *
  * @param {object} event
  */
  function onOverviewSlideClicked(event) {

    // TODO There's a bug here where the event listeners are not
    // removed after deactivating the overview.
    if (appState.eventsAreBound && isOverview()) {
      event.preventDefault();

      let element = event.target;

      while (element && !element.nodeName.match(/section/gi )) {
        element = element.parentNode;
      }

      if (element && !element.classList.contains('disabled' )) {

        deactivateOverview();

        if (element.nodeName.match(/section/gi )) {
          const h = parseInt(element.getAttribute('data-index-h' ), 10 );
          const v = parseInt(element.getAttribute('data-index-v' ), 10);

          navigateSlide(h, v);
        }

      }
    }

  }

  /**
  * Handles clicks on links that are set to preview in the
  * iframe overlay.
  *
  * @param {object} event
  */
  function onPreviewLinkClicked(event) {

    if (event.currentTarget && event.currentTarget.hasAttribute('href' )) {
      const url = event.currentTarget.getAttribute('href');
      if (url) {
        showPreview(url);
        event.preventDefault();
      }
    }

  }

  /**
  * Handles click on the auto-sliding controls element.
  *
  * @param {object} [event]
  */
  function onAutoSlidePlayerClick() {

    // Replay
    if (Reveal.isLastSlide() && appState.config.loop === false) {
      navigateSlide(0, 0);
      resumeAutoSlide();
    } else if (autoSlidePaused) {
      // Resume
      resumeAutoSlide();
    } else {
      // Pause
      pauseAutoSlide();
    }

  }


  // --------------------------------------------------------------------//
  // ------------------------ PLAYBACK COMPONENT ------------------------//
  // --------------------------------------------------------------------//


  /**
  * Constructor for the playback component, which displays
  * play/pause/progress controls.
  *
  * @param {HTMLElement} container The component will append
  * itself to this
  * @param {function} progressCheck A method which will be
  * called frequently to get the current progress on a range
  * of 0-1
  */
  function Playback(container, progressCheck) {

    // Cosmetics
    this.diameter = 100;
    this.diameter2 = this.diameter/2;
    this.thickness = 6;

    // Flags if we are currently playing
    this.playing = false;

    // Current progress on a 0-1 range
    this.progress = 0;

    // Used to loop the animation smoothly
    this.progressOffset = 1;

    this.container = container;
    this.progressCheck = progressCheck;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'playback';
    this.canvas.width = this.diameter;
    this.canvas.height = this.diameter;
    this.canvas.style.width = this.diameter2 + 'px';
    this.canvas.style.height = this.diameter2 + 'px';
    this.context = this.canvas.getContext('2d');

    this.container.appendChild(this.canvas);

    this.render();

  }

  /**
  * @param value
  */
  Playback.prototype.setPlaying = function (value) {

    const wasPlaying = this.playing;

    this.playing = value;

    // Start repainting if we weren't already
    if (!wasPlaying && this.playing) {
      this.animate();
    } else {
      this.render();
    }

  };

  Playback.prototype.animate = function () {

    const progressBefore = this.progress;

    this.progress = this.progressCheck();

    // When we loop, offset the progress so that it eases
    // smoothly rather than immediately resetting
    if (progressBefore > 0.8 && this.progress < 0.2) {
      this.progressOffset = this.progress;
    }

    this.render();

    if (this.playing) {
      appState.features.requestAnimationFrameMethod.call(window, this.animate.bind(this ));
    }

  };

  /**
  * Renders the current progress and playback state.
  */
  Playback.prototype.render = function () {

    const progress = this.playing ? this.progress : 0,
    radius = (this.diameter2 ) - this.thickness,
    x = this.diameter2,
    y = this.diameter2,
    iconSize = 28;

    // Ease towards 1
    this.progressOffset += (1 - this.progressOffset ) * 0.1;

    const endAngle = (- Math.PI / 2 ) + (progress * (Math.PI * 2 ));
    const startAngle = (- Math.PI / 2 ) + (this.progressOffset * (Math.PI * 2 ));

    this.context.save();
    this.context.clearRect(0, 0, this.diameter, this.diameter);

    // Solid background color
    this.context.beginPath();
    this.context.arc(x, y, radius + 4, 0, Math.PI * 2, false);
    this.context.fillStyle = 'rgba(0, 0, 0, 0.4 )';
    this.context.fill();

    // Draw progress track
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2, false);
    this.context.lineWidth = this.thickness;
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.2 )';
    this.context.stroke();

    if (this.playing) {
      // Draw progress on top of track
      this.context.beginPath();
      this.context.arc(x, y, radius, startAngle, endAngle, false);
      this.context.lineWidth = this.thickness;
      this.context.strokeStyle = '#fff';
      this.context.stroke();
    }

    this.context.translate(x - (iconSize / 2 ), y - (iconSize / 2 ));

    // Draw play/pause icons
    if (this.playing) {
      this.context.fillStyle = '#fff';
      this.context.fillRect(0, 0, iconSize / 2 - 4, iconSize);
      this.context.fillRect(iconSize / 2 + 4, 0, iconSize / 2 - 4, iconSize);
    } else {
      this.context.beginPath();
      this.context.translate(4, 0);
      this.context.moveTo(0, 0);
      this.context.lineTo(iconSize - 4, iconSize / 2);
      this.context.lineTo(0, iconSize);
      this.context.fillStyle = '#fff';
      this.context.fill();
    }

    this.context.restore();

  };

  Playback.prototype.on = function (type, listener) {
    this.canvas.addEventListener(type, listener, false);
  };

  Playback.prototype.off = function (type, listener) {
    this.canvas.removeEventListener(type, listener, false);
  };

  Playback.prototype.destroy = function () {

    this.playing = false;

    if (this.canvas.parentNode) {
      this.container.removeChild(this.canvas);
    }

  };


  // --------------------------------------------------------------------//
  // ------------------------------- API --------------------------------//
  // --------------------------------------------------------------------//


  Reveal = {
    VERSION: VERSION,

    initialize: initialize,
    configure: configure,
    sync: sync,

    // Navigation methods
    slide: navigateSlide,
    left: navigateLeft,
    right: navigateRight,
    up: navigateUp,
    down: navigateDown,
    prev: navigatePrev,
    next: navigateNext,

    // Fragment methods
    navigateFragment: navigateFragment,
    prevFragment: previousFragment,
    nextFragment: nextFragment,

    // Deprecated aliases
    navigateTo: navigateSlide,
    navigateLeft: navigateLeft,
    navigateRight: navigateRight,
    navigateUp: navigateUp,
    navigateDown: navigateDown,
    navigatePrev: navigatePrev,
    navigateNext: navigateNext,

    // Forces an update in slide layout
    layout: layout,

    // Randomizes the order of slides
    shuffle: shuffle,

    // Returns an object with the available routes as booleans (left/right/top/bottom)
    availableRoutes: availableRoutes,

    // Returns an object with the available fragments as booleans (prev/next)
    availableFragments: availableFragments,

    // Toggles a help overlay with keyboard shortcuts
    toggleHelp: toggleHelp,

    // Toggles the overview mode on/off
    toggleOverview: toggleOverview,

    // Toggles the "black screen" mode on/off
    togglePause: togglePause,

    // Toggles the auto slide mode on/off
    toggleAutoSlide: toggleAutoSlide,

    // State checks
    isOverview: isOverview,
    isPaused: isPaused,
    isAutoSliding: isAutoSliding,
    isSpeakerNotes: isSpeakerNotes,

    // Slide preloading
    loadSlide: loadSlide,
    unloadSlide: unloadSlide,

    // Adds or removes all internal event listeners (such as keyboard)
    addEventListeners: addEventListeners,
    removeEventListeners: removeEventListeners,

    // Facility for persisting and restoring the presentation state
    getState: getState,
    setState: setState,

    // Presentation progress
    getSlidePastCount: getSlidePastCount,

    // Presentation progress on range of 0-1
    getProgress: getProgress,

    // Returns the indices of the current, or specified, slide
    getIndices: getIndices,

    // Returns an Array of all slides
    getSlides: getSlides,

    // Returns the total number of slides
    getTotalSlides: getTotalSlides,

    // Returns the slide element at the specified index
    getSlide: getSlide,

    // Returns the slide background element at the specified index
    getSlideBackground: getSlideBackground,

    // Returns the speaker notes string for a slide, or null
    getSlideNotes: getSlideNotes,

    // Returns the previous slide element, may be null
    getPreviousSlide: function () {
      return previousSlide;
    },

    // Returns the current slide element
    getCurrentSlide: function () {
      return appState.currentSlide;
    },

    // Returns the current scale of the presentation content
    getScale: function () {
      return appState.scale;
    },

    // Returns the current appState.configuration object
    getConfig: function () {
      return appState.config;
    },

    // Helper method, retrieves query string as a key/value hash
    getQueryHash: function () {
      const query = {};

      location.search.replace(/[A-Z0-9]+?=([\w.%-]*)/gi, (a) => {
        query[ a.split('=' ).shift() ] = a.split('=' ).pop();
      });

      // Basic deserialization
      for (const i in query) {
        const value = query[ i ];

        query[ i ] = deserialize(unescape(value ));
      }

      return query;
    },

    // Returns true if we're currently on the first slide
    isFirstSlide: function () {
      return (appState.indexh === 0 && appState.indexv === 0);
    },

    // Returns true if we're currently on the last slide
    isLastSlide: function () {
      if (appState.currentSlide) {
        // Does this slide has next a sibling?
        if (appState.currentSlide.nextElementSibling ) return false;

        // If it's vertical, does its parent have a next sibling?
        if (isVerticalSlide(appState.currentSlide ) && appState.currentSlide.parentNode.nextElementSibling ) return false;

        return true;
      }

      return false;
    },

    // Checks if reveal.js has been loaded and is ready for use
    isReady: function () {
      return appState.loaded;
    },

    // Forward event binding to the reveal DOM element
    addEventListener: function (type, listener, useCapture) {
      if ('addEventListener' in window) {
        (appState.dom.wrapper || document.querySelector('.reveal' ) ).addEventListener(type, listener, useCapture);
      }
    },
    removeEventListener: function (type, listener, useCapture) {
      if ('addEventListener' in window) {
        (appState.dom.wrapper || document.querySelector('.reveal' ) ).removeEventListener(type, listener, useCapture);
      }
    },

    // Programatically triggers a keyboard event
    triggerKey: function (keyCode) {
      onDocumentKeyDown({ keyCode: keyCode });
    },

    // Registers a new shortcut to include in the help overlay
    registerKeyboardShortcut: function (key, value) {
      keyboardShortcuts[key] = value;
    }
  };

  return Reveal;

};

export default reveal;
