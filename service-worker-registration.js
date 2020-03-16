'use strict';

if ('serviceWorker' in navigator) {
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', function() {
    // service-worker.js *must* be located at the top-level directory relative to your site.
    // It won't be able to control pages unless it's located at the same level or higher than them.
    navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
      // updatefound is fired if service-worker.js changes.
      initSW(reg);
      reg.onupdatefound = function() {
        initSW(reg);
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });

    navigator.serviceWorker.onmessage = function(evt) {
      var message = evt.data;
      if (message.type === 'to_window_reload') {
        window.location.reload();
      }
    }
  });
}

function initSW(reg){
  if(reg.waiting){
    setWaitingSWFlag(reg.waiting);
    return;
  }
  if(reg.installing){
    reg.installing.onstatechange = (evt) => {
      if(evt.target.state === 'installed'){ // installed state means waiting for active
        reg.waiting && setWaitingSWFlag(reg.waiting);
      }else if(evt.target.state === 'activated'){
        window.waitingServiceWorker = null;
        window._appStore && window._appStore.dispatch({
          type: 'SET_WAITING_SERVICE_WORKER_FLAG',
          flag: false,
        })
      }
    }
  }
}

function setWaitingSWFlag(sw){
  if(window._appStore){
    window.waitingServiceWorker = sw;
    window._appStore.dispatch({
      type: 'SET_WAITING_SERVICE_WORKER_FLAG',
      flag: true,
    })
  }else{
    window.waitingServiceWorker = sw;
  }
}

function confirmUpdateSW(sw){
  console.log('Service work is updated and is waiting for install.');

  // let confirmDiv = document.createElement('div');
  // confirmDiv.style.position = 'fixed';
  // confirmDiv.style.top = '10px';
  // confirmDiv.innerHTML = 'Service work is updated and is waiting for install. Do you want to install?';
  // document.body.appendChild(confirmDiv);


  let result = confirm('Service work is updated and is waiting for install. Do you want to install?');
  if(result){
    sw.postMessage({type: 'to_sw_skip_waiting'});
  }
}

