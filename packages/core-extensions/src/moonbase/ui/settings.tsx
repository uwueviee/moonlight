import {
  DictionarySettingType,
  ExtensionSettingType,
  ExtensionSettingsManifest,
  NumberSettingType,
  SelectSettingType
} from "@moonlight-mod/types/config";
import WebpackRequire from "@moonlight-mod/types/discord/require";
import { MoonbaseExtension } from "../types";

type SettingsProps = {
  ext: MoonbaseExtension;
  name: string;
  setting: ExtensionSettingsManifest;
};

type SettingsComponent = React.ComponentType<SettingsProps>;

export default (require: typeof WebpackRequire) => {
  const React = require("common_react");
  const spacepack = require("spacepack_spacepack");
  const CommonComponents = require("common_components");
  const Flux = require("common_flux");

  const { MoonbaseSettingsStore } = require("moonbase_stores") as ReturnType<
    typeof import("../stores")["stores"]
  >;

  function Boolean({ ext, name, setting }: SettingsProps) {
    const { FormSwitch } = CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value: MoonbaseSettingsStore.getExtensionConfig<boolean>(
            ext.id,
            name
          ),
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    return (
      <FormSwitch
        value={value ?? false}
        hideBorder={true}
        onChange={(value: boolean) => {
          MoonbaseSettingsStore.setExtensionConfig(ext.id, name, value);
        }}
      >
        {displayName}
      </FormSwitch>
    );
  }

  function Number({ ext, name, setting }: SettingsProps) {
    const { Slider, ControlClasses } = CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value: MoonbaseSettingsStore.getExtensionConfig<number>(ext.id, name),
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    const castedSetting = setting as NumberSettingType;
    const min = castedSetting.min ?? 0;
    const max = castedSetting.max ?? 100;

    return (
      <div>
        <label className={ControlClasses.title}>{displayName}</label>
        <Slider
          initialValue={value ?? 0}
          minValue={castedSetting.min ?? 0}
          maxValue={castedSetting.max ?? 100}
          onValueChange={(value: number) => {
            const rounded = Math.max(min, Math.min(max, Math.round(value)));
            MoonbaseSettingsStore.setExtensionConfig(ext.id, name, rounded);
          }}
        />
      </div>
    );
  }

  function String({ ext, name, setting }: SettingsProps) {
    const { TextInput, ControlClasses } = CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value: MoonbaseSettingsStore.getExtensionConfig<string>(ext.id, name),
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    return (
      <div>
        <label className={ControlClasses.title}>{displayName}</label>
        <TextInput
          value={value ?? ""}
          onChange={(value: string) => {
            MoonbaseSettingsStore.setExtensionConfig(ext.id, name, value);
          }}
        />
      </div>
    );
  }

  function Select({ ext, name, setting }: SettingsProps) {
    const { ControlClasses, SingleSelect } = CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value: MoonbaseSettingsStore.getExtensionConfig<string>(ext.id, name),
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    const castedSetting = setting as SelectSettingType;
    const options = castedSetting.options;

    return (
      <div>
        <label className={ControlClasses.title}>{displayName}</label>
        <SingleSelect
          autofocus={false}
          clearable={false}
          value={value ?? ""}
          options={options.map((o) => ({ value: o, label: o }))}
          onChange={(value: string) => {
            MoonbaseSettingsStore.setExtensionConfig(ext.id, name, value);
          }}
        />
      </div>
    );
  }

  function List({ ext, name, setting }: SettingsProps) {
    const { ControlClasses, Select, useVariableSelect, multiSelect } =
      CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value:
            MoonbaseSettingsStore.getExtensionConfig<string>(ext.id, name) ??
            [],
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    const castedSetting = setting as SelectSettingType;
    const options = castedSetting.options;

    return (
      <div>
        <label className={ControlClasses.title}>{displayName}</label>
        <Select
          autofocus={false}
          clearable={false}
          options={options.map((o) => ({ value: o, label: o }))}
          {...useVariableSelect({
            onSelectInteraction: multiSelect,
            value: new Set(Array.isArray(value) ? value : [value]),
            onChange: (value: string) => {
              MoonbaseSettingsStore.setExtensionConfig(
                ext.id,
                name,
                Array.from(value)
              );
            }
          })}
        />
      </div>
    );
  }

  function Dictionary({ ext, name, setting }: SettingsProps) {
    const { TextInput, ControlClasses, Button, Flex } = CommonComponents;
    const { value, displayName } = Flux.useStateFromStores(
      [MoonbaseSettingsStore],
      () => {
        return {
          value: MoonbaseSettingsStore.getExtensionConfig<
            Record<string, string>
          >(ext.id, name),
          displayName: MoonbaseSettingsStore.getExtensionConfigName(
            ext.id,
            name
          )
        };
      },
      [ext.id, name]
    );

    const castedSetting = setting as DictionarySettingType;
    const entries = Object.entries(value ?? {});

    return (
      <Flex direction={Flex.Direction.VERTICAL}>
        <label className={ControlClasses.title}>{displayName}</label>
        {entries.map(([key, val], i) => (
          // FIXME: stylesheets
          <div
            key={i}
            style={{
              display: "grid",
              height: "40px",
              gap: "10px",
              gridTemplateColumns: "1fr 1fr 40px"
            }}
          >
            <TextInput
              value={key}
              onChange={(newKey: string) => {
                entries[i][0] = newKey;
                MoonbaseSettingsStore.setExtensionConfig(
                  ext.id,
                  name,
                  Object.fromEntries(entries)
                );
              }}
            />
            <TextInput
              value={val}
              onChange={(newValue: string) => {
                entries[i][1] = newValue;
                MoonbaseSettingsStore.setExtensionConfig(
                  ext.id,
                  name,
                  Object.fromEntries(entries)
                );
              }}
            />
            <Button
              color={Button.Colors.RED}
              size={Button.Sizes.ICON}
              onClick={() => {
                entries.splice(i, 1);
                MoonbaseSettingsStore.setExtensionConfig(
                  ext.id,
                  name,
                  Object.fromEntries(entries)
                );
              }}
            >
              X
            </Button>
          </div>
        ))}

        <Button
          look={Button.Looks.FILLED}
          color={Button.Colors.GREEN}
          onClick={() => {
            entries.push([`entry-${entries.length}`, ""]);
            MoonbaseSettingsStore.setExtensionConfig(
              ext.id,
              name,
              Object.fromEntries(entries)
            );
          }}
        >
          Add new entry
        </Button>
      </Flex>
    );
  }

  function Setting({ ext, name, setting }: SettingsProps) {
    const elements: Partial<Record<ExtensionSettingType, SettingsComponent>> = {
      [ExtensionSettingType.Boolean]: Boolean,
      [ExtensionSettingType.Number]: Number,
      [ExtensionSettingType.String]: String,
      [ExtensionSettingType.Select]: Select,
      [ExtensionSettingType.List]: List,
      [ExtensionSettingType.Dictionary]: Dictionary
    };
    const element = elements[setting.type];
    if (element == null) return <></>;
    return React.createElement(element, { ext, name, setting });
  }

  function Settings({ ext }: { ext: MoonbaseExtension }) {
    const { Flex } = CommonComponents;
    return (
      <Flex direction={Flex.Direction.VERTICAL}>
        {Object.entries(ext.manifest.settings!).map(([name, setting]) => (
          <Setting ext={ext} key={name} name={name} setting={setting} />
        ))}
      </Flex>
    );
  }

  return {
    Boolean,
    Settings
  };
};