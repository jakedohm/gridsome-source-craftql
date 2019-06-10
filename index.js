const { setContext } = require('apollo-link-context')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

const {
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  RenameTypes,
} = require('graphql-tools')

const {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
} = require(`./transforms`)

class CraftQLSource {
  static defaultOptions() {
    return {
      url: undefined,
      fieldName: 'craft',
      typeName: undefined,
      headers: {},
    }
  }

  constructor(api, options) {
    const { url, fieldName, token } = options
    let { typeName } = options

    /****************************************************
      STEP ONE: Validation
    ****************************************************/

    if (!url) {
      throw new Error(`Missing url option.`)
    }

    if (!token) {
      throw new Error(`Missing token option.`)
    }

    // If typeName isn't defined, default to fieldName
    if (!typeName) {
      typeName = fieldName
    }

    /****************************************************
      STEP TWO: Stich your remote CraftQL schema into
      the local GraphQL schema.
    ****************************************************/

    api.createSchema(async ({ addSchema }) => {
      const remoteSchema = await this.getRemoteExecutableSchema(url, token)
      const namespacedSchema = await this.namespaceSchema(
        remoteSchema,
        fieldName,
        typeName
      )

      addSchema(namespacedSchema)
    })

    /****************************************************
      STEP THREE: Find your entry sections, and create
      routes for any of them that have a template.
    ****************************************************/

    // api.createManagedPages(async ({ graphql, createPage }) => {
    //   // Query our local GraphQL schema to get all sections
    //   const { data: sectionsQuery } = await graphql(`
    //     query {
    //       ${fieldName} {
    //         sections {
    //           handle
    //         }
    //       }
    //     }
    //   `)

    //   // Loop over each section
    //   await Promise.all(
    //     sectionsQuery.sections.map(async section => {
    //       const templatePath = `./src/templates/${section.handle}.vue`
    //       const templateExists = existsSync(templatePath)

    //       // If there's not a template for this section in the "templates" directory, don't register it as a route.
    //       if (!templateExists) return false

    //       // Query our local GraphQL schema for this section's entries
    //       const { data: entriesQuery } = await graphql(`
    //       query {
    //         ${fieldName} {
    //           entries(section: ${section.handle}) {
    //             slug,
    //             id,
    //             uri
    //           }
    //         }
    //       }
    //     `)

    //       // If this section doesn't have entries, we don't care about it
    //       if (!entriesQuery) return false

    //       // Loop through each entry in this section, and register it as a page (route)
    //       entriesQuery.entries.forEach(entry => {
    //         createPage({
    //           path: `/${entry.uri}`,
    //           component: `./src/templates/${section.handle}.vue`,

    //           // Provide variables about this entry which can be used in the entry's tempate, and <page-query>
    //           context: {
    //             id: entry.id,
    //             section: {
    //               id: section.id,
    //               handle: section.handle,
    //             },
    //           },
    //         })
    //       })
    //     })
    //   )
    // })
  }

  async getRemoteExecutableSchema(uri, token) {
    const http = new HttpLink({ uri, fetch })
    const link = setContext(() => ({
      headers: {
        Authorization: `bearer ${token}`,
      },
    })).concat(http)
    const remoteSchema = await introspectSchema(link)

    return makeRemoteExecutableSchema({
      schema: remoteSchema,
      link,
    })
  }

  namespaceSchema(schema, fieldName, typeName) {
    return transformSchema(schema, [
      new StripNonQueryTransform(),
      new RenameTypes(name => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform(typeName, fieldName),
    ])
  }
}

module.exports = CraftQLSource
