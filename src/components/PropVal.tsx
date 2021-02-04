import React from 'react';
import styled from 'styled-components';
import { handleSetSubject } from '../helpers/useQueryParam';
import { useResource } from '../lib/react';
import { Value } from '../lib/value';
import ValueComp from './ValueComp';

type Props = {
  propertyURL: string;
  value: Value;
};

const PropValRow = styled.div`
  display: block;
  margin-bottom: 1rem;
`;

/** A single Property / Value renderer */
function PropVal({ propertyURL, value }: Props): JSX.Element {
  const property = useResource(propertyURL);

  const handleClickProp = (e): void => {
    e.preventDefault();
    handleSetSubject(propertyURL);
  };

  return (
    <PropValRow>
      <a onClick={handleClickProp} href={propertyURL}>
        {property?.get('https://atomicdata.dev/properties/shortname').toString() || propertyURL}
      </a>
      <ValueComp value={value} />
    </PropValRow>
  );
}

export default PropVal;