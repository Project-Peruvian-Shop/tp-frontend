// src/Icons/icons.ts
// import view1 from "./actions/view-1.svg";
// import edit1 from "./actions/edit-1.svg";
import delete1 from "./actions/delete-1.svg";
import view2 from "./actions/view-2.svg";
import edit2 from "./actions/edit-2.svg";
import delete2 from "./actions/delete-2.svg";
import back from "./actions/back.svg";

import categoria from "./dashboard/categoria.svg";
import cotizacion from "./dashboard/cotizacion.svg";
import dashboard from "./dashboard/dashboard.svg";
import mensaje from "./dashboard/mensaje.svg";
import producto from "./dashboard/producto.svg";
import usuarioIcon from "./dashboard/usuario.svg";
import usuarioCircle from "./dashboard/user-circle.svg";
import usuarioIc from "./dashboard/user.svg";
import logout from "./dashboard/logout.svg";
import logoutWhite from "./logout-white.svg";
import cotizacionesD from "./cotizacionesD.svg";
import changeState from "./dashboard/change_state_icon.svg";

import userIcon from "./user.svg";
import view from "./view.svg";

import about from "./About_company/user_icon.png";

import whatsappPri from "./rrss/whatsapp-primary.svg";
import whatsappSec from "./rrss/whatsapp-secondary.svg";
import whatsappWhi from "./whatsapp-white.svg";
import outlook from "./rrss/outlook.svg";
import email from "./rrss/email.svg";
import phone from "./rrss/phone.svg";
import phone2 from "./Contact/phone_contact.svg";
import email2 from "./Contact/email_contact.svg";
import location from "./Contact/location_contact.png";
import tiktok from "./rrss/tik_tok.svg";
import facebook from "./rrss/facebook.svg";
import instagram from "./rrss/instagram.svg";

import cart from "./navbar/cart.svg";
import search from "./navbar/search.svg";
import items from "./navbar/items.svg";
import arrowUp from "./navbar/arrow-up.svg";
import arrowDown from "./navbar/arrow-down.svg";

import repeat from "./table/repeat.svg";

import check from "./dashboard/check.svg";
import clipboard from "./dashboard/clipboard.svg";
import message from "./dashboard/message.svg";

import arrowRight from "./dashboard/arrow-right.svg";

import emailInput from "./Login/email-input.svg";
import passwordInput from "./Login/password-input.svg";
import eyeShowPassword from "./Login/eye-password-show.svg";
import eyeHidePassword from "./Login/eye-password-hide.svg.svg";
import userInput from "./Login/user-input.svg";
import phoneInput from "./Login/phone-input.svg";
import download from "./download.svg";

export const Icons = {
  "delete-primary": delete1,
  "view-secondary": view2,
  "edit-secondary": edit2,
  "delete-secondary": delete2,
  download,
  categoria,
  cotizacion,
  dashboard,
  mensaje,
  producto,
  usuarioIcon,
  usuarioCircle,
  usuarioIc,
  logout,
  outlook,
  whatsappSec,
  cotizacionesD,
  changeState,
  logoutWhite,
  about,
  email,
  phone,
  phone2,
  email2,
  location,
  tiktok,
  facebook,
  instagram,
  whatsappPri,
  whatsappWhi,
  userIcon,
  view,
  cart,
  search,
  items,
  arrowUp,
  arrowDown,
  repeat,
  check,
  clipboard,
  message,
  arrowRight,
  emailInput,
  passwordInput,
  eyeShowPassword,
  eyeHidePassword,
  userInput,
  phoneInput,
  back
};

export type IconName = keyof typeof Icons;
