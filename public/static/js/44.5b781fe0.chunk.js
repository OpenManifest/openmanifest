(this.webpackJsonp=this.webpackJsonp||[]).push([[44],{452:function(e,n,t){"use strict";var r,l=t(6),a=t.n(l),o=t(405),i=t.n(o),c=t(0),u=t.n(c),s=t(423),m=t(419),p=t(119),d=t(421),f=t(203),S=t(120),h=t(60),E=t(5),b=t(4),y=Object(S.gql)(r||(r=i()(["\n  query QueryDropzonesCompact {\n    dropzones {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n"])));var g=b.a.create({warning:{flexDirection:"row",alignItems:"center",height:56,width:"100%",backgroundColor:"#ffbb33",justifyContent:"space-between",paddingHorizontal:32}});n.a=function(e){var n,t,r,l,o,i,b,z=e.navigation,P=e.previous,k=e.scene,v=Object(c.useState)(!1),w=a()(v,2),T=w[0],C=w[1],j=Object(S.useQuery)(y).data,D=Object(h.h)((function(e){return e.global})),O=D.currentDropzone,U=(D.theme,Object(h.g)()),x=!(null==O||null==(n=O.currentUser)||null==(t=n.user)||null==(r=t.rigs)||!r.length),N=!(null==O||null==(l=O.currentUser)||null==(o=l.user)||!o.exitWeight),q=!x||!N;return u.a.createElement(u.a.Fragment,null,u.a.createElement(s.a.Header,null,P?u.a.createElement(s.a.BackAction,{onPress:z.goBack}):null,u.a.createElement(s.a.Content,{title:k.descriptor.options.title}),u.a.createElement(m.a,{onDismiss:function(){return C(!1)},visible:T,anchor:u.a.createElement(p.a,{onPress:function(){return C(!0)},style:{color:"white",marginRight:8}},null==O?void 0:O.name)},null==j||null==(i=j.dropzones)||null==(b=i.edges)?void 0:b.map((function(e){var n;return u.a.createElement(m.a.Item,{title:null==e||null==(n=e.node)?void 0:n.name,onPress:function(){U(h.b.setDropzone(null==e?void 0:e.node)),C(!1)}})})))),q&&u.a.createElement(E.a,{style:g.warning},u.a.createElement(d.a,null,"You need to complete your profile"),u.a.createElement(f.a,{color:"black",mode:"outlined",onPress:function(){return z.navigate("Profile")}},"Take me there")))}},501:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return y}));var r=t(401),l=t(0),a=t(452),o=l.lazy((function(){return t.e(39).then(t.bind(null,512))})),i=l.lazy((function(){return Promise.all([t.e(2),t.e(36)]).then(t.bind(null,513))})),c=l.lazy((function(){return Promise.all([t.e(19),t.e(40)]).then(t.bind(null,514))})),u=l.lazy((function(){return Promise.all([t.e(0),t.e(21)]).then(t.bind(null,515))})),s=l.lazy((function(){return Promise.all([t.e(0),t.e(22)]).then(t.bind(null,516))})),m=l.lazy((function(){return Promise.all([t.e(0),t.e(1),t.e(5),t.e(26)]).then(t.bind(null,517))})),p=l.lazy((function(){return Promise.all([t.e(25),t.e(31)]).then(t.bind(null,518))})),d=l.lazy((function(){return Promise.all([t.e(0),t.e(6),t.e(46)]).then(t.bind(null,519))})),f=l.lazy((function(){return Promise.all([t.e(0),t.e(6),t.e(47)]).then(t.bind(null,520))})),S=l.lazy((function(){return Promise.all([t.e(0),t.e(7),t.e(28)]).then(t.bind(null,521))})),h=l.lazy((function(){return Promise.all([t.e(0),t.e(7),t.e(29)]).then(t.bind(null,522))})),E=l.lazy((function(){return Promise.all([t.e(30),t.e(37)]).then(t.bind(null,523))})),b=Object(r.a)();function y(){return l.createElement(b.Navigator,{screenOptions:{headerShown:!0,header:function(e){return l.createElement(a.a,e)},cardStyle:{flex:1}}},l.createElement(b.Screen,{name:"SettingsScreen",component:o,options:{title:"Settings"}}),l.createElement(b.Screen,{name:"DropzoneSettingsScreen",component:i}),l.createElement(b.Screen,{name:"UpdateDropzoneScreen",component:m}),l.createElement(b.Screen,{name:"PlanesScreen",component:p,options:{title:"Planes"}}),l.createElement(b.Screen,{name:"CreatePlaneScreen",component:u,options:{title:"New plane"}}),l.createElement(b.Screen,{name:"UpdatePlaneScreen",component:s,options:{title:"Edit plane"}}),l.createElement(b.Screen,{name:"TicketTypesScreen",component:c,options:{title:"Ticket types"}}),l.createElement(b.Screen,{name:"CreateTicketTypeScreen",component:d,options:{title:"New ticket type"}}),l.createElement(b.Screen,{name:"UpdateTicketTypeScreen",component:f,options:{title:"Edit ticket type"}}),l.createElement(b.Screen,{name:"CreateExtraScreen",component:S,options:{title:"Create ticket add-on"}}),l.createElement(b.Screen,{name:"UpdateExtraScreen",component:h,options:{title:"Update ticket add-on"}}),l.createElement(b.Screen,{name:"ExtrasScreen",component:E,options:{title:"Ticket add-ons"}}))}}}]);
//# sourceMappingURL=44.5b781fe0.chunk.js.map