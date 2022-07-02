import React, { FC } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CloudConfiguration, InstanceConfiguration } from './sections';
import { UniverseFormData, clusterModes } from './utils/dto';

interface UniverseFormProps {
  defaultFormData: UniverseFormData;
  mode: clusterModes;
  title: string;
}

export const UniverseForm: FC<UniverseFormProps> = ({ defaultFormData, mode, title }) => {
  const formMethods = useForm<UniverseFormData>({
    mode: 'onChange',
    defaultValues: defaultFormData
  });

  const onSubmit = (data: UniverseFormData) => console.log(data);

  return (
    <>
      <h4>{title}</h4>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <CloudConfiguration />
          <br />
          <InstanceConfiguration />
        </form>
      </FormProvider>
    </>
  );
};
