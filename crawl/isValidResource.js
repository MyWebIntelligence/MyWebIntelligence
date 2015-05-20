"use strict";

module.exports = function isValidResource(resource){
    return resource.http_status < 400 && !resource.other_error && resource.content_type.includes('html');
};
