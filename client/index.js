"use strict";

var React = require('react');
var App = require('./components/App');

function addUserLoginInfosToHeader(userInfos){
    var header = document.body.querySelector('header');
    var userInfoTpl = document.body.querySelector('template#user');
    
    var userInfo = userInfoTpl.content.cloneNode(true);
    userInfo.querySelector('.username').textContent = userInfos.username;
    
    header.appendChild(userInfo);
    
}


function login(userInfos){
    var loginBox = document.body.querySelector('.login-box');
    loginBox.remove();
    
    addUserLoginInfosToHeader(userInfos);
}


document.addEventListener('DOMContentLoaded', function(){
    
    React.render(App(), document.body);
    
    /*
    var googleLoginButton = document.body.querySelector('.login-box button.google');
    var spinnerElement = document.body.querySelector('.login-box .spinner');
    
    var spinner = (function(){
        var timeout;
        var interval;
        
        function transitionEndListener(e){
            spinnerElement.classList.toggle('fadein');
        }
        
        return {
            on: function(){
                // no need for a spinner for 1sec according to various UX studies
                timeout = setTimeout(function(){
                    spinnerElement.removeAttribute('hidden');
                    spinnerElement.addEventListener('transitionend', transitionEndListener);
                    
                    // if not done inside a timeout, this does not trigger a transition
                    setTimeout(transitionEndListener, 20);
                    
                }, 800);

            },
            off: function(){
                clearTimeout(timeout);
                timeout = undefined;
                clearInterval(interval);
                interval = undefined;
                spinnerElement.removeEventListener('transitionend', transitionEndListener);
                spinnerElement.setAttribute('hidden', '');
            }
        }
    })();
    
    
    googleLoginButton.addEventListener('click', function(e){
        spinner.on();
        
        setTimeout(function(){
            spinner.off();
            login({
                username: "Amar Lakel"
            });
        }, Math.random()*10*1000)
    });*/
});