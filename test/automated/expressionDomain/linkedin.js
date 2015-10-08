"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var linkedinHeuristics = require('../../../expressionDomain/heuristics/linkedin');

describe('Linkedin expression domain heuristics', function(){
    
    it('https://www.linkedin.com/company/mitacs', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/company/mitacs');
        
        return assert.eventually.strictEqual(edNameP, "linkedin/company/mitacs");
    });
    
    it('https://www.linkedin.com/pub/emmanuel-charonnat/11/128/684/en', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/pub/emmanuel-charonnat/11/128/684/en');
        
        return assert.eventually.strictEqual(edNameP, "linkedin/emmanuel-charonnat");
    });
    
    it('https://www.linkedin.com/company/1004390', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/company/1004390');
        
        return assert.eventually.strictEqual(edNameP, "linkedin/company/1004390");
    });
    
    it('https://fr.linkedin.com/in/amarlakel', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://fr.linkedin.com/in/amarlakel');
        
        return assert.eventually.strictEqual(edNameP, "linkedin/amarlakel");
    });
    
    it('https://www.linkedin.com/grp/post/82242-6055346562769448961?trk=groups-post-b-title', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/grp/post/82242-6055346562769448961?trk=groups-post-b-title');
        
        return assert.eventually.strictEqual(edNameP, "https://www.linkedin.com/grp/post/82242-6055346562769448961?trk=groups-post-b-title");
    });
    
    it('https://www.linkedin.com/grp/home?gid=82242&trk=groups-post-b-discgroup', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/grp/home?gid=82242&trk=groups-post-b-discgroup');
        
        return assert.eventually.strictEqual(edNameP, "https://www.linkedin.com/grp/home?gid=82242&trk=groups-post-b-discgroup");
    })
    
    it('https://www.linkedin.com/pulse/how-become-better-listener-dr-travis-bradberry', function(){
        var edNameP = linkedinHeuristics.getExpressionDomainName('https://www.linkedin.com/pulse/how-become-better-listener-dr-travis-bradberry');
        
        return assert.eventually.strictEqual(edNameP, "https://www.linkedin.com/pulse/how-become-better-listener-dr-travis-bradberry");
    });
    
        
    it('Invalid URLs', function(){
        return Promise.all([
            "http://www.linkedin.com/shareArticle?mini=true&url=http%3A%2F%2Fsemellesdecuivre.com%2Fsemelles-de-cuivre-2%2Fvictime-darthrite-est-sans-douleur%2F&title=Victime%20d%E2%80%99arthrite%20est%20%E2%80%98sans%20douleur%E2%80%99",
            "http://www.linkedin.com/legal/copyright-policy",
            "http://fr.linkedin.com/pub/dir/+/Lakel"
        ].map(function(url){
            var edNameP = linkedinHeuristics.getExpressionDomainName(url);
            
            return assert.isRejected(edNameP, url+' should be an invalid URL for the Linkedin heuristics');
        }));
        
    });
    
});