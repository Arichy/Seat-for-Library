import Vue from 'vue'
import {
    Button, Input, Select, Option, Table, TableColumn, Row, Col, Container,
    Header, Main, MessageBox,Loading
} from 'element-ui';

Vue.use(Button);
Vue.use(Input);
Vue.use(Select);
Vue.use(Option);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Row);
Vue.use(Col);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);

Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;

Vue.prototype.$alert = MessageBox.alert;
