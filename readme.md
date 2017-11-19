# ovh-dynhost

this module is actually a simple wrapper of official ovh module in order to automatically set your dynhosting in OVH.

Pre requisites :
- have a domain name in ovh
- set a inital record of dynHost in ovh manager []
it uses ping module to detect presence of people around a wifi box with their smartphone and deduce if the house is empty or not.

- init script with json input :
.init ({name : { ip : '192.168.1.95'})

- launch script : .launch

- read event
  * value changed (user , isalive?)
  * house entry
  * house leave
