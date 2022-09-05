import React, { useContext, useEffect, useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Alert, Button, Form, InputGroup, ProgressBar } from "react-bootstrap"
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/authContext"
import CenteredSpinner from "../../components/ui/CenteredSpinner"
import { useTranslation } from "react-i18next"
import classes from "./StaticPage.module.scss"
import { useParams } from "react-router"
import { createPage, updatePage, getPageDetails } from "../../api/ourstory"
import { PageLayout } from "../../api/models"

const MutateStaticPage = ({ action }) => {
  const [pageToEdit, setPageToEdit] = useState()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [layouts, setLayouts] = useState(Object.values(PageLayout))
  const [invalidTitle, setInvalidTitle] = useState(false)
  const [invalidSlug, setInvalidSlug] = useState(false)
  const [invalidDescription, setInvalidDescription] = useState(false)
  const [invalidLayouts, setInvalidLayouts] = useState(false)
  const [invalidContent, setInvalidContent] = useState(false)
  const [inValidLayout, setInvalidLayout] = useState(false)
  const [beingUpdated, setBeingUpdated] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const { t, i18n } = useTranslation()
  const { getToken } = useContext(AuthContext)
  const editorRef = useRef(null)
  const navigate = useNavigate()
  const params = useParams()
  const locale = params.locale

  useEffect(() => {
    if (action === "EDIT") {
      const s = params.slug
      setSlug(s)
      loadPageDetails(s)
    }
    if (action === "TRANSLATE") {
      const s = params.slug
      setSlug(s)
    }
  }, [])

  const loadPageDetails = async (slug) => {
    setIsFetching(true)
    const token = await getToken()
    getPageDetails(token, slug, locale)
      .then((page) => {
        setPageToEdit(page)
        setTitle(page.name)
        setDescription(page.description)
        setLayouts(page.layouts)
      })
      .catch((error) => console.log(error))
      .finally(() => setIsFetching(false))
  }
  const titleChanged = (value) => {
    setTitle(value)
  }
  const slugChanged = (value) => {
    let slug = value.replaceAll(" ", "_")
    setSlug(slug.toLowerCase())
  }

  const handleLayoutToggle = (layout) => {
    if (layouts.includes(layout)) {
      let newLayouts = layouts.filter((t) => t !== layout)
      setLayouts(newLayouts)
    } else {
      setLayouts([...layouts, layout])
    }
  }
  const submit = async () => {
    setBeingUpdated(true)
    if (action === "ADD" || action === "TRANSLATE") {
      await savePage()
    }
    if (action === "EDIT") {
      await saveUpatedPage()
    }
    setBeingUpdated(false)
  }
  const savePage = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent()
      const token = await getToken()
      createPage(token, {
        slug,
        name: title,
        description,
        content,
        layouts,
        locale,
      })
        .then(() => navigate("/pages"))
        .catch((error) => console.log(error))
    }
  }
  const saveUpatedPage = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent()
      const token = await getToken()
      updatePage(token, {
        slug,
        name: title,
        description,
        content,
        layouts,
        locale,
      })
        .then(() => navigate("/pages"))
        .catch((error) => console.log(error))
    }
  }
  const cancel = () => {
    navigate(-1)
  }
  if (isFetching) {
    return <CenteredSpinner />
  }
  return (
    <React.Fragment>
      <Form>
        <div>
          <strong>{t("label_language")}: </strong>
          <span>{t(`language_${locale}`)}</span>
        </div>
        <InputGroup hasValidation className={classes.inputSmall}>
          <Form.Control
            type="text"
            required
            isInvalid={invalidTitle}
            placeholder={t("label_title")}
            value={title}
            onChange={(e) => titleChanged(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">
            {t("error_title_required")}
          </Form.Control.Feedback>
        </InputGroup>
        <InputGroup hasValidation className={classes.inputSmall}>
          <Form.Control
            type="text"
            required
            disabled={pageToEdit || action === "TRANSLATE"}
            isInvalid={invalidSlug}
            placeholder={t("label_static_page_slug")}
            value={slug}
            onChange={(e) => slugChanged(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">
            {t("error_static_page_slug_required")}
          </Form.Control.Feedback>
        </InputGroup>
        <InputGroup hasValidation className={classes.input}>
          <Form.Control
            type="text"
            required
            isInvalid={invalidDescription}
            placeholder={t("label_description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">
            {t("error_description_required")}
          </Form.Control.Feedback>
        </InputGroup>
        <Alert variant={invalidLayouts ? "danger" : "light"}>
          {t("error_page_layout_required")}
        </Alert>
        {Object.values(PageLayout).map((layout, i) => (
          <div key={i} className={classes.pageLayoutContainer}>
            <div className={classes.tooltip}>
              <span className="material-symbols-outlined">help</span>
              <span className={classes.tooltiptext}>
                {t(`tooltip_${layout}`)}
              </span>
            </div>
            <Form.Check
              key={i}
              disabled={action === "TRANSLATE"}
              className={classes.checkbox}
              type="checkbox"
              label={t(`page_layout_${layout}`)}
              checked={layouts.includes(layout)}
              onChange={() => handleLayoutToggle(layout)}
            />
          </div>
        ))}
      </Form>
      <div className={classes.input}>
        <Editor
          apiKey="c9ccdazp104scf9y6wk43d91mf001po1s78xjfadde281gd0"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={pageToEdit ? pageToEdit.content : ""}
          init={{
            height: 500,
            menubar: false,
            plugins: ["lists", "link"],
            directionality: locale === "ar" ? "rtl" : "ltr",
            toolbar:
              "undo redo | blocks | fontSize | fontFamily |" +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | link |" +
              "removeformat",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
          }}
        />
        {invalidContent && (
          <Alert variant="danger">{t("error_page_content_required")}</Alert>
        )}
      </div>

      <div className={classes.actionContainer}>
        <Button className={classes.submit} variant="dark" onClick={submit}>
          {t("button_save")}
        </Button>
        <Button variant="outline-dark" onClick={cancel}>
          {t("button_cancel")}
        </Button>
      </div>
      {beingUpdated && (
        <div>
          <strong>{t("message_being_updated")}</strong>
          <ProgressBar animated now={45} />
        </div>
      )}
    </React.Fragment>
  )
}

export default MutateStaticPage
