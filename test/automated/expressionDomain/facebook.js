"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var facebookHeuristics = require('../../../expressionDomain/heuristics/facebook');

describe('Facebook expression domain heuristics', function(){
    
    it('http://facebook.com/pages/Sciences-et-Avenir/194705390569710', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('http://facebook.com/pages/Sciences-et-Avenir/194705390569710');
        
        return assert.eventually.strictEqual(edNameP, "facebook/Sciences-et-Avenir");
    });
    
    it('http://fr-fr.facebook.com/mymsa', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('http://fr-fr.facebook.com/mymsa');
        
        return assert.eventually.strictEqual(edNameP, "facebook/mymsa");
    });
    
    it('https://fr-ca.facebook.com/jdemontreal', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://fr-ca.facebook.com/jdemontreal');
        
        return assert.eventually.strictEqual(edNameP, "facebook/jdemontreal");
    });
    
    it('http://www.facebook.com/dailymotion', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('http://www.facebook.com/dailymotion');
        
        return assert.eventually.strictEqual(edNameP, "facebook/dailymotion");
    });
    
    // Currently, event pages are their own expression domain
    // It should be the person who created them, but this information is hard to get at this point
    // Having each event its own expression domain is still a better choice that one expression domain
    // for all events
    it('https://www.facebook.com/events/229566017249612/', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/events/229566017249612/');
        
        return assert.eventually.strictEqual(edNameP, "https://www.facebook.com/events/229566017249612/");
    });
    
    it('https://www.facebook.com/groups/1445829062394130/?fref=ts', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/groups/1445829062394130/?fref=ts');
        
        return assert.eventually.strictEqual(edNameP, "facebook/groups/1445829062394130");
    });
    
    it('https://www.facebook.com/profile.php?id=100004739384734', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/profile.php?id=100004739384734');
        
        return assert.eventually.strictEqual(edNameP, "facebook/100004739384734");
    });
    
    it('https://www.facebook.com/', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/');
        
        return assert.eventually.strictEqual(edNameP, "facebook.com");
    });
    
    it('https://www.facebook.com/policies/?ref=pf', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/policies/?ref=pf');
        
        return assert.eventually.strictEqual(edNameP, "facebook.com");
    });
    
    it('https://www.facebook.com/privacy/explanation', function(){
        var edNameP = facebookHeuristics.getExpressionDomainName('https://www.facebook.com/privacy/explanation');
        
        return assert.eventually.strictEqual(edNameP, "facebook.com");
    });
    
    
    it('Invalid URLs', function(){
        return Promise.all([
            'http://www.facebook.com/share.php?u=http://www.danger-sante.org/la-cafeine-leffet-les-effets-de-la-cafeine-avec-cafe-et-les-autres-boissons/',
            'http://www.facebook.com/sharer.php?u=http://www.agevillage.com/actualite-11684-1-hypertrophie-benigne-de-la-prostate-l-incontinence-urinaire-au-masculin-encore-un-sujet-tabou.html',
            'https://www.facebook.com/badges/?ref=pf',
            'https://www.facebook.com/campaign/landing.php?placement=pflo&campaign_id=402047449186&extra_1=auto',
            'https://www.facebook.com/careers/?ref=pf',
            'https://www.facebook.com/directory/pages/',
            'https://www.facebook.com/directory/people/',
            'https://www.facebook.com/directory/places/',
            'https://www.facebook.com/help/?ref=pf',
            'https://www.facebook.com/lite/',
            'https://www.facebook.com/login/',
            'https://www.facebook.com/mobile/?ref=pf',
            'https://www.facebook.com/places/',
            'https://www.facebook.com/r.php',
            'https://www.facebook.com/r.php?locale=fr_FR',
            'https://www.facebook.com/recover/initiate?lwv=110',
            'https://www.facebook.com/find-friends?ref=pf'
        ].map(function(url){
            var edNameP = facebookHeuristics.getExpressionDomainName(url);
            
            return assert.isRejected(edNameP, url+' should be an invalid URL for the Facebook heuristics');
        }));
        
    });
    
});