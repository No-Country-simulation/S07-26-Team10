import commonEs from "./common/es.json";
import commonEn from "./common/en.json";
import homeEs from "./home/es.json";
import homeEn from "./home/en.json";
import navEs from "./nav/es.json";
import navEn from "./nav/en.json";
import footerEs from "./footer/es.json";
import footerEn from "./footer/en.json";
import authEs from "./auth/es.json";
import authEn from "./auth/en.json";
import adminEs from "./admin/es.json";
import adminEn from "./admin/en.json";
import reportEs from "./report/es.json";
import reportEn from "./report/en.json";

export const esMessages = {
  Common: commonEs,
  HomePage: homeEs,
  Nav: navEs,
  Footer: footerEs,
  LoginPage: authEs,
  AdminPage: adminEs,
  Report: reportEs,
};

export const enMessages = {
  Common: commonEn,
  HomePage: homeEn,
  Nav: navEn,
  Footer: footerEn,
  LoginPage: authEn,
  AdminPage: adminEn,
  Report: reportEn,
};

export const messagesMap = {
  es: esMessages,
  en: enMessages,
};

