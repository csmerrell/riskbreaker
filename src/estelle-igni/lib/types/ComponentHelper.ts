import type { Component } from 'vue';

export type PropsOf<C> = C extends Component<infer P> ? P : never;
