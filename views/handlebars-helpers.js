"use strict";
const { renderEsiTags } = require("exp-config");
//const { getRange, hasFeature } = require("../helpers/abTest");
//const imageOptimzer = require("../helpers/image-optimizer");


const escapeDoubleQuotes = (str) => {
  return str.replace(/\\/g, "\\\\");
};

const helpers = {};

helpers.toJSON = (object) => {
  return JSON.stringify(object);
};


/*
 * Sample use:
  {{#abTest name="abTestName" testGroup=base.cookies.__extblt [renderEsiTags=true cookieName=__extblt]}}
    A-body
  {{else}}
    B-body
  {{/abTest}}

  The else-case is optional
  renderEsiTags should only be used for testing
 */
helpers.abTest = function (context) {
  const name = context.hash.name;
  const range = getRange(name);
  const testGroup = parseInt(context.hash.testGroup);
  const cookieName = context.hash.cookieName || "__extblt";
  let result = "";

  // Print B-case if unknown test-name
  if (!hasFeature(name)) {
    if (context.inverse) {
      return context.inverse(this);
    } else {
      return "";
    }
  }
  if (context.hash.renderEsiTags || renderEsiTags) {
    result += `<esi:choose><esi:when test="($int($(HTTP_COOKIE{'${cookieName}'})) >= ${range.min}) && ($int($(HTTP_COOKIE{'${cookieName}'})) <= ${range.max})">`;
    result += escapeDoubleQuotes(context.fn(this));
    result += "</esi:when>";

    if (context.inverse) {
      result += "<esi:otherwise>";
      result += escapeDoubleQuotes(context.inverse(this));
      result += "</esi:otherwise>";
    }
    result += "</esi:choose>";

  } else {
    if (range && testGroup >= range.min && testGroup <= range.max) {
      result = context.fn(this);
    } else if (context.inverse) {
      result = context.inverse(this);

    }
  }

  return result;
};

helpers.imageOptimzer = (image, size) => {
  size = Number.isInteger(size) ? size : undefined;
  return new Handlebars.SafeString(imageOptimzer.getOptimizedImageUrl(image, size));
};

module.exports = helpers;
