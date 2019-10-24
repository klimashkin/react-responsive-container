import {Component, createContext} from 'react';

export const SizeWatcherContext = createContext(null);

export default class SizeWatcherProvider extends Component {
  constructor(props, context) {
    super(props, context);

    this.contextObj = {
      checkIn: this.checkInChildContainer.bind(this),
      checkOut: this.checkOutChildContainer.bind(this),
    };

    // Map: {[<DomElement>]: {instance, dom: <DomElement>}}
    this.childrenContainers = new Map();
  }

  componentDidMount() {
    // Create resizeObservable that handles all children containers size change
    // One for all: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/z6ienONUb5A/F5-VcUZtBAAJ
    this.resizeObservable = new ResizeObserver(entries => {
      for (const {target} of entries) {
        const {width, height} = target.getBoundingClientRect();

        this.childrenContainers.get(target)?.handleSize({width, height});
      }
    });

    // Observe each checkedIn element in a loop.
    // Observer callback will be called once on the next requestAnimationFrame with all elements in `entries` array
    this.childrenContainers.forEach(({dom}) => {
      this.resizeObservable.observe(dom);
    });
  }

  checkInChildContainer(dom, handleSize) {
    this.childrenContainers.set(dom, {handleSize, dom});
    this.resizeObservable?.observe(dom);
  }

  checkOutChildContainer(dom) {
    this.childrenContainers.delete(dom);
    this.resizeObservable?.unobserve(dom);
  }

  render() {
    return (
      <SizeWatcherContext.Provider value={this.contextObj}>
        {this.props.children}
      </SizeWatcherContext.Provider>
    );
  }
}
