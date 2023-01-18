import { useState, useEffect, Children } from 'react'
import { Form } from 'react-bootstrap'
import { Api, ClassificationContractV4, DomainContractV3 } from './BsddApi'

const api = new Api()
api.baseUrl = 'https://test.bsdd.buildingsmart.org'

interface Props {
  activeClassificationUri: string | undefined
  recursiveMode: boolean
  classifications: ClassificationContractV4[]
  setClassifications: (value: ClassificationContractV4[]) => void
  domains: { [id: string]: DomainContractV3 }
}

function Classifications(props: Props) {
  const [classificationCount, setClassificationCount] = useState<number>(0)
  const [classificationUris, setClassificationUris] = useState<{
    [id: string]: Promise<ClassificationContractV4 | null>
  }>({})

  function getClassification(classificationUri: string): Promise<ClassificationContractV4 | null> {
    const p: Promise<ClassificationContractV4 | null> = new Promise(function (resolve) {
      //, reject) {
      const queryParameters = {
        namespaceUri: classificationUri,
        includeChildClassificationReferences: true,
        // languageCode: 'NL'
      }
      resolve(
        api.api
          .classificationV4List(queryParameters)
          .then((response) => {
            if (response.status !== 200) {
              // reject();
              console.log('Status error...')
              console.log(response.status)
              return null
            }
            return response.data
          })
          .catch((err) => {
            console.log('Catch error...')
            console.log(err)
            return null
          }),
      )
    })
    setClassificationUris({
      ...classificationUris,
      classificationUri: p,
    })
    return p
  }
  function getClassificationDomainName(classification: ClassificationContractV4): string {
    if (classification && classification.domainNamespaceUri) {
      return props.domains[classification.domainNamespaceUri].name
    }
    return 'unknown'
  }

  useEffect(() => {
    setClassificationCount(0)
    if (props.activeClassificationUri) {
      const initialClassificationUris: {
        [id: string]: Promise<ClassificationContractV4 | null>
      } = {}
      if (props.activeClassificationUri) {
        initialClassificationUris[props.activeClassificationUri] = getClassification(props.activeClassificationUri)
      }
      setClassificationUris(initialClassificationUris)
    }
  }, [props.activeClassificationUri])

  useEffect(() => {
    setClassificationCount(Object.keys(classificationUris).length)
    if (classificationCount === Object.keys(classificationUris).length) {
      return
    }
    Promise.allSettled(Object.values(classificationUris)).then(function (results) {
      const r = results
        .map((result) => {
          if (result.status === 'fulfilled') {
            return result.value
          }
          return null
        })
        .filter((x): x is ClassificationContractV4 => x !== null)

      results.map((result) => {
        if (result.status === 'fulfilled') {
          const c = result.value
          if (c && c.classificationRelations) {
            const extendedClassificationUris: {
              [id: string]: Promise<ClassificationContractV4 | null>
            } = {
              ...classificationUris,
            }
            c.classificationRelations.forEach((classificationRelation) => {
              if (!(classificationRelation.relatedClassificationUri in Object.keys(classificationUris))) {
                extendedClassificationUris[classificationRelation.relatedClassificationUri] = getClassification(
                  classificationRelation.relatedClassificationUri,
                )
              }
            })
            setClassificationUris(extendedClassificationUris)
          }
        }
        return 'unknown'
      })
      props.setClassifications(r)
    })
  }, [classificationUris])

  return (
    <div>
      {Children.toArray(
        props.classifications.map((classification, index) => (
          <Form.Group className='mb-3 row' key={index}>
            <Form.Label className='col-sm-5 col-form-label'>{getClassificationDomainName(classification)}</Form.Label>
            <div className='col-sm-7'>
              <Form.Control placeholder={classification.name} disabled />
            </div>
          </Form.Group>
        )),
      )}
    </div>
  )
}
export default Classifications
