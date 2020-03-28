# PCGRL Brush

## Setup

```bash
npm install
npm start
```

Once this is running, the dev server can be accessed via browser at:

```
http://localhost:3000/
```

This project was bootstrapped using `create-react-app`. You can see the other readme for it at [cra-README.md](/cra-README.md) with more instructions.

## Layout

The layout of the UI can be generally updated using the `src/Layout/styles.css` file. This can be used to adjust the spacing between each section.

By uncommenting all the background colors, spacing issues can be more easily debugged:

<img src="docs/color-layout-debug.png" width=320 />

## Components

Each component is located in the `src/` directory and given its own folder. Each folder contains an `index.tsx` and a `styles.css` file to describe the TypeScript and CSS respectively.

## Icons

All icon files are available in the `src/Icons` directory but they are not all componentized. They are from a library available here:

[https://icomoon.io/#icons](https://icomoon.io/#icons)

To componentize an icon simply add a component for it in `src/Icons/index.tsx`. Example:

```typescript
// Define a unique constructor name starting with Icon
import { ReactComponent as IconFoo } from "./000-foo.svg";

// ...
function Icon(props: IconProps) {
    const iconProps = {
        // ...
    };
    switch (props.iconName) {
        case "pencil":
            return <IconPencil {...iconProps} />;
        case "foo-unique-name": // give the icon a unique name
            return <IconFoo {...iconProps} />; // return its component
        default:
            // This is basically an unsupported icon
            return <div>{"UNSUPPORTED ICON: ${iconName}"}</div>;
    }
}
```

## Services

Services are ways to encapsulate our utility classes in a convenient place. Example:

```typescript
export class MyUtilityService {
    public someMethodOfTheService() {
        // ...
    }

    public static someStaticMethodOfTheService() {
        // ...
    }
}
```

### TensorFlowService

TensorFlow operations live inside `src/services/TensorFlow` as stateless functions in the `TensorFlowService` class. This allows for separation of concerns and makes them easily usable anywhere else in the code without much boilerplate.
