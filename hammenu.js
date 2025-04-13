const hamMenu = document.querySelector('.ham-menu');

const offScreenMenu = document.querySelector('.off-screen-menu');

hamMenu.addEventLister('click', () {
  hamMenu.classlist.toggle('active');
  offScreenMenu.classList.toggle('active');
})
