(this.webpackJsonp=this.webpackJsonp||[]).push([[3],{492:function(e,t,n){"use strict";var r,o,a;n.d(t,"a",(function(){return r})),function(e){e.All="All",e.Videos="Videos",e.Images="Images"}(r||(r={})),function(e){e[e.Passthrough=0]="Passthrough",e[e.LowQuality=1]="LowQuality",e[e.MediumQuality=2]="MediumQuality",e[e.HighestQuality=3]="HighestQuality",e[e.H264_640x480=4]="H264_640x480",e[e.H264_960x540=5]="H264_960x540",e[e.H264_1280x720=6]="H264_1280x720",e[e.H264_1920x1080=7]="H264_1920x1080",e[e.H264_3840x2160=8]="H264_3840x2160",e[e.HEVC_1920x1080=9]="HEVC_1920x1080",e[e.HEVC_3840x2160=10]="HEVC_3840x2160"}(o||(o={})),function(e){e[e.High=0]="High",e[e.Medium=1]="Medium",e[e.Low=2]="Low",e[e.VGA640x480=3]="VGA640x480",e[e.IFrame1280x720=4]="IFrame1280x720",e[e.IFrame960x540=5]="IFrame960x540"}(a||(a={}))},515:function(e,t,n){"use strict";n.d(t,"b",(function(){return q})),n.d(t,"a",(function(){return Q}));var r=n(0),o=n(13),a=n(9),i=n.n(a),c=n(1),l=n(2),s=r.createContext({goTo:function(){return null},index:0});var u=n(6),p=n.n(u),d=n(7),f=n.n(d),m=n(4),b=n(8),y=n(80),h=n(89),v=n(55),g=n(14),x=n.n(g);function w(e){var t,n=e.left,r=e.width;return{transform:[{scaleX:r},{translateX:(t=n/r,Math.round(100*t+Number.EPSILON)/100||0)}]}}var C,P=n(33),O=n(41);function E(){return(E=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}try{C=m.a.createAnimatedComponent(n(373).default)}catch(G){var T=!1;C=function(e){var t=e.name,n=f()(e,["name"]);return T||(/(Cannot find module|Module not found|Cannot resolve module)/.test(G.message)||console.error(G),console.warn("Tried to use the icon '"+t+"' in a component from 'react-native-paper-tabs', but 'react-native-vector-icons/MaterialCommunityIcons' could not be loaded.","To remove this warning, try installing 'react-native-vector-icons' or use another method to specify icon: https://callstack.github.io/react-native-paper/icons.html."),T=!0),r.createElement(m.a.Text,E({},n,{selectable:!1}),"\u25a1")}}var j=c.a.create({icon:{backgroundColor:"transparent"}}),I=function(e){var t=e.name,n=e.color,o=e.size,a=e.style,i=f()(e,["name","color","size","style"]);return r.createElement(C,E({selectable:!1,name:t,color:n,size:o,style:[{lineHeight:o},j.icon,a]},i))};function k(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function L(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?k(Object(n),!0).forEach((function(t){p()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):k(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var A=m.a.createAnimatedComponent(P.a);function R(e){var t=e.tab,n=e.tabIndex,o=e.active,a=e.goTo,i=e.onTabLayout,c=e.activeColor,s=e.textColor,u=e.theme,p=e.position,d=e.offset,f=e.childrenCount,m=e.uppercase,b=e.mode,y=e.iconPosition,h=e.showTextLabel,v=r.useMemo((function(){return x()(c).alpha(.32).rgb().string()}),[c]),g=function(e){var t=e.activeColor,n=e.active,o=e.textColor;return r.useMemo((function(){return{color:n?t:o,opacity:n?1:.6}}),[n,t,o])}({active:o,position:p,offset:d,activeColor:c,textColor:s,tabIndex:n,childrenCount:f}),w=g.color,C=g.opacity;return r.createElement(l.a,{key:t.props.label,style:[S.tabRoot,"fixed"===b&&S.tabRootFixed],onLayout:function(e){return i(n,e)}},r.createElement(O.a,{onPress:function(){return a(n)},onPressIn:function(){},style:[S.touchableRipple,"top"===y&&S.touchableRippleTop],rippleColor:v,accessibilityTraits:"button",accessibilityRole:"button",accessibilityComponentType:"button",accessibilityLabel:t.props.label,accessibilityState:{selected:o},testID:"tab_"+n},r.createElement(l.a,{style:[S.touchableRippleInner,"top"===y&&S.touchableRippleInnerTop]},t.props.icon?r.createElement(l.a,{style:[S.iconContainer,"top"!==y&&S.marginRight]},r.createElement(I,{selectable:!1,accessibilityElementsHidden:!0,importantForAccessibility:"no",name:t.props.icon||"",style:{color:w,opacity:C},size:24})):null,h?r.createElement(A,{selectable:!1,style:[S.text,"top"===y&&S.textTop,L(L({},u.fonts.medium),{},{color:w,opacity:C})]},m?t.props.label.toUpperCase():t.props.label):null)))}var S=c.a.create({tabRoot:{position:"relative"},tabRootFixed:{flex:1},touchableRipple:{height:48,justifyContent:"center",alignItems:"center"},touchableRippleTop:{height:72},touchableRippleInner:{flexDirection:"row",alignItems:"center",justifyContent:"center",paddingRight:16,paddingLeft:16,minWidth:90,maxWidth:360},touchableRippleInnerTop:{flexDirection:"column"},iconContainer:{width:24,height:24},text:L({textAlign:"center",letterSpacing:1},b.a.select({web:{transitionDuration:"150ms",transitionProperty:"all"},default:{}})),textTop:{marginTop:6},marginRight:{marginRight:8}});function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function H(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?D(Object(n),!0).forEach((function(t){p()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function M(e){var t=e.index,n=e.goTo,o=e.children,a=e.position,s=e.offset,u=e.theme,d=e.dark,b=e.style,g=e.iconPosition,C=e.showTextLabel,P=e.showLeadingSpace,O=e.uppercase,E=e.mode,T=u.colors,j=u.dark,I=u.mode,k=c.a.flatten(b)||{},L=k.backgroundColor,A=k.elevation,S=void 0===A?4:A,D=f()(k,["backgroundColor","elevation"]),M=L||(j&&"adaptive"===I?Object(h.a)(S,T.surface):T.primary),_=T.primary===M,z=("boolean"===typeof d?d:"transparent"!==M&&!x()(M).isLight())?"#fff":"#000",F=_?z:u.colors.primary,N=r.useRef(null),q=r.useRef(0),Q=r.useRef(null),G=r.useRef(null),U=r.useState(null),W=i()(U,2),J=W[0],X=W[1],B=function(e){var t=e.index,n=e.layouts,o=r.useRef(null),a=r.useCallback((function(){if(o.current&&n.current){var e=n.current[t];e&&o.current.setNativeProps({style:w({left:e.x,width:e.width})})}}),[t,o,n]);return[o,a,null]}({tabsLayout:J,layouts:G,index:t,offset:s,position:a,childrenCount:o.length}),K=i()(B,3),Y=K[0],Z=K[1],$=K[2],ee=r.useCallback((function(e){X(e.nativeEvent.layout)}),[X]),te=r.useCallback((function(e,t){G.current=H(H({},G.current),{},p()({},e,t.nativeEvent.layout)),Z()}),[G,Z]),ne=r.useCallback((function(e){if(G.current&&"scrollable"===E){var n=G.current[t];if(n&&Q.current&&J){var r=J.width,o=q.current;if("next"===e){var a,i=null===(a=G.current)||void 0===a?void 0:a[t+1];i&&(n=i)}else if("prev"===e){var c,l=null===(c=G.current)||void 0===c?void 0:c[t-1];l&&(n=l)}var s=n.x-o,u=s,p=-r+s+n.width;p>-50?Q.current.scrollTo({x:o+p+50,y:0,animated:!0}):u<50&&Q.current.scrollTo({x:o+u-50,y:0,animated:!0})}}}),[E,G,t,Q,q,J]);return r.useEffect((function(){ne()}),[ne]),r.useEffect((function(){Z()}),[Z]),r.createElement(l.a,{style:V.relative},r.createElement(v.a,{style:[{backgroundColor:M,elevation:S},D,V.tabs,"top"===g&&V.tabsTopIcon],onLayout:ee},r.createElement(y.a,{ref:Q,contentContainerStyle:"fixed"===E?V.fixedContentContainerStyle:void 0,onContentSizeChange:function(e){N.current=e},onScroll:function(e){q.current=e.nativeEvent.contentOffset.x},scrollEventThrottle:25,horizontal:!0,showsHorizontalScrollIndicator:!1,alwaysBounceHorizontal:"scrollable"===E,scrollEnabled:"scrollable"===E},"scrollable"===E&&P?r.createElement(l.a,{style:V.scrollablePadding}):null,r.Children.map(o,(function(e,i){return r.createElement(R,{theme:u,tabIndex:i,tab:e,active:t===i,onTabLayout:te,goTo:n,activeColor:F,textColor:z,position:a,offset:s,childrenCount:o.length,uppercase:O,iconPosition:g,showTextLabel:C,mode:E})})),r.createElement(m.a.View,{ref:Y,pointerEvents:"none",style:[V.indicator,{backgroundColor:F},$]})),r.createElement(m.a.View,{style:[V.removeTopShadow,{height:S,backgroundColor:M,top:-S}]})))}var V=c.a.create({relative:{position:"relative"},removeTopShadow:{position:"absolute",left:0,right:0,zIndex:2},scrollablePadding:{width:52},tabs:{height:48},tabsTopIcon:{height:72},fixedContentContainerStyle:{flex:1},indicator:H({position:"absolute",height:2,width:1,left:0,bottom:0},b.a.select({web:{backgroundColor:"transparent",transitionDuration:"150ms",transitionProperty:"all",transformOrigin:"left",willChange:"transform"},default:{}}))});var _=c.a.create({root:{flex:1}}),z=function(e){var t=e.theme,n=e.dark,o=e.style,a=e.defaultIndex,c=e.onChangeIndex,u=e.iconPosition,p=e.showTextLabel,d=e.showLeadingSpace,f=e.uppercase,m=e.mode,b=r.useState(a||0),y=i()(b,2),h=y[0],v=y[1],g=r.useCallback((function(e){v(e),c(e)}),[v,c]),x=e.children,w=x[h];if(!w||!w)return null;var C={index:h,goTo:g,children:x,theme:t,dark:n,style:o,offset:void 0,position:void 0,iconPosition:u,showTextLabel:p,showLeadingSpace:d,uppercase:f,mode:m};return r.createElement(l.a,{style:_.root},r.createElement(M,C),r.createElement(s.Provider,{value:{goTo:g,index:h}},w))},F=function(){var e={};return{set:function(t,n){e[t]=n},get:function(t){return e[t]}}}();function N(e,t){return t?F.get(t)||e||0:e||0}var q=Object(o.c)((function(e){var t=e.onChangeIndex,n=e.children,o=e.persistKey,a=e.theme,i=e.dark,c=e.style,l=e.defaultIndex,s=e.mode,u=void 0===s?"fixed":s,p=e.uppercase,d=void 0===p||p,f=e.iconPosition,m=void 0===f?"leading":f,y=e.showTextLabel,h=void 0===y||y,v=e.showLeadingSpace,g=void 0===v||v,x=r.useCallback((function(e){o&&"web"===b.a.OS&&F.set(o,e),null===t||void 0===t||t(e)}),[o,t]);return r.createElement(z,{style:c,dark:i,theme:a,defaultIndex:N(l,o),onChangeIndex:x,uppercase:d,iconPosition:m,showTextLabel:h,showLeadingSpace:g,mode:u},n)}));function Q(e){var t=e.children;return r.Children.only(t)}},516:function(e,t,n){"use strict";n.d(t,"b",(function(){return E})),n.d(t,"a",(function(){return T}));n(9);var r,o=n(11),a=n.n(o),i=(n(327),n(475));!function(e){e.GRANTED="granted",e.UNDETERMINED="undetermined",e.DENIED="denied"}(r||(r={}));var c=n(6),l=n.n(c),s="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),u=new Uint8Array(16);function p(){if(!s)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return s(u)}for(var d=[],f=0;f<256;++f)d[f]=(f+256).toString(16).substr(1);var m=function(e,t){var n=t||0,r=d;return[r[e[n++]],r[e[n++]],r[e[n++]],r[e[n++]],"-",r[e[n++]],r[e[n++]],"-",r[e[n++]],r[e[n++]],"-",r[e[n++]],r[e[n++]],"-",r[e[n++]],r[e[n++]],r[e[n++]],r[e[n++]],r[e[n++]],r[e[n++]]].join("")};var b,y=function(e,t,n){var r=t&&n||0;"string"==typeof e&&(t="binary"===e?new Array(16):null,e=null);var o=(e=e||{}).random||(e.rng||p)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,t)for(var a=0;a<16;++a)t[r+a]=o[a];return t||m(o)},h=n(492);function v(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function g(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?v(Object(n),!0).forEach((function(t){l()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):v(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var x=(b={},l()(b,h.a.All,"video/mp4,video/quicktime,video/x-m4v,video/*,image/*"),l()(b,h.a.Images,"image/*"),l()(b,h.a.Videos,"video/mp4,video/quicktime,video/x-m4v,video/*"),b),w={get name(){return"ExponentImagePicker"},launchImageLibraryAsync:function(e){var t,n,r,o;return a.a.async((function(i){for(;;)switch(i.prev=i.next){case 0:return t=e.mediaTypes,n=void 0===t?h.a.Images:t,r=e.allowsMultipleSelection,o=void 0!==r&&r,i.next=3,a.a.awrap(P({mediaTypes:n,allowsMultipleSelection:o}));case 3:return i.abrupt("return",i.sent);case 4:case"end":return i.stop()}}),null,null,null,Promise)},launchCameraAsync:function(e){var t,n,r,o;return a.a.async((function(i){for(;;)switch(i.prev=i.next){case 0:return t=e.mediaTypes,n=void 0===t?h.a.Images:t,r=e.allowsMultipleSelection,o=void 0!==r&&r,i.next=3,a.a.awrap(P({mediaTypes:n,allowsMultipleSelection:o,capture:!0}));case 3:return i.abrupt("return",i.sent);case 4:case"end":return i.stop()}}),null,null,null,Promise)},getCameraPermissionsAsync:function(){return a.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",C());case 1:case"end":return e.stop()}}),null,null,null,Promise)},requestCameraPermissionsAsync:function(){return a.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",C());case 1:case"end":return e.stop()}}),null,null,null,Promise)},getMediaLibraryPermissionsAsync:function(e){return a.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",C());case 1:case"end":return e.stop()}}),null,null,null,Promise)},requestMediaLibraryPermissionsAsync:function(e){return a.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",C());case 1:case"end":return e.stop()}}),null,null,null,Promise)}};function C(){return{status:r.GRANTED,expires:"never",granted:!0,canAskAgain:!0}}function P(e){var t=e.mediaTypes,n=e.capture,r=void 0!==n&&n,o=e.allowsMultipleSelection,i=void 0!==o&&o,c=x[t],l=document.createElement("input");return l.style.display="none",l.setAttribute("type","file"),l.setAttribute("accept",c),l.setAttribute("id",y()),i&&l.setAttribute("multiple","multiple"),r&&l.setAttribute("capture","camera"),document.body.appendChild(l),new Promise((function(e,t){l.addEventListener("change",(function(){var t,n;return a.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:if(!l.files){r.next=14;break}if(i){r.next=8;break}return r.next=4,a.a.awrap(O(l.files[0]));case 4:t=r.sent,e(g({cancelled:!1},t)),r.next=12;break;case 8:return r.next=10,a.a.awrap(Promise.all(Array.from(l.files).map(O)));case 10:n=r.sent,e({cancelled:!1,selected:n});case 12:r.next=15;break;case 14:e({cancelled:!0});case 15:document.body.removeChild(l);case 16:case"end":return r.stop()}}),null,null,null,Promise)}));var n=new MouseEvent("click");l.dispatchEvent(n)}))}function O(e){return new Promise((function(t,n){var r=new FileReader;r.onerror=function(){n(new Error("Failed to read the selected media because the operation failed."))},r.onload=function(e){var n=e.target,r=n.result,o=function(){return t({uri:r,width:0,height:0})};if("string"===typeof(null==n?void 0:n.result)){var a=new Image;a.src=n.result,a.onload=function(){var e,n;return t({uri:r,width:null!=(e=a.naturalWidth)?e:a.width,height:null!=(n=a.naturalHeight)?n:a.height})},a.onerror=function(){return o()}}else o()},r.readAsDataURL(e)}))}function E(){var e,t,n=arguments;return a.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:return e=n.length>0&&void 0!==n[0]&&n[0],t="function"===typeof w.requestMediaLibaryPermissionsAsync?w.requestMediaLibaryPermissionsAsync:w.requestMediaLibraryPermissionsAsync,r.abrupt("return",t(e));case 3:case"end":return r.stop()}}),null,null,null,Promise)}function T(e){return a.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:if(w.launchImageLibraryAsync){t.next=2;break}throw new i.a("ImagePicker","launchImageLibraryAsync");case 2:return t.next=4,a.a.awrap(w.launchImageLibraryAsync(null!=e?e:{}));case 4:return t.abrupt("return",t.sent);case 5:case"end":return t.stop()}}),null,null,null,Promise)}}}]);
//# sourceMappingURL=3.5a25aeeb.chunk.js.map