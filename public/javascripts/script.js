var tl = gsap.timeline();



tl.from("#overlay>h1",{
    y:-30,
    opacity:0,
    duration:3,
    scale:0.5
})
tl.from("#start",{
   y:-30,
   opacity:0
})
tl.from("#login",{
    y:-30,
    opacity:0
})
tl.from("#overlay1 h2",{
    x:10,
    opacity:0,
})
