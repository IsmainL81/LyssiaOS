import {
  useMemo,
  useState,
} from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useLyssia } from "../core/LyssiaCore";

export default function Memory() {
  const {
    memories,
    searchMemories,
    deleteMemory,
    clearMemories,
  } = useLyssia();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const filteredMemories =
    useMemo(() => {
      let result =
        searchMemories(search);

      if (
        typeFilter !== "all"
      ) {
        result =
          result.filter(
            (memory) =>
              memory.type ===
              typeFilter
          );
      }

      if (
        categoryFilter !== "all"
      ) {
        result =
          result.filter(
            (memory) =>
              memory.category ===
              categoryFilter
          );
      }

      return result;
    }, [
      memories,
      search,
      typeFilter,
      categoryFilter,
      searchMemories,
    ]);

  function getCategoryLabel(
    category
  ) {
    switch (category) {
      case "semantic":
        return "Sémantique";

      case "episodic":
        return "Épisodique";

      default:
        return "—";
    }
  }

  function getCategoryColor(
    category
  ) {
    switch (category) {
      case "semantic":
        return "warning";

      case "episodic":
        return "primary";

      default:
        return "default";
    }
  }

  function getTypeLabel(
    type
  ) {
    switch (type) {
      case "vision":
        return "Vision";

      case "conversation":
        return "Conversation";

      default:
        return "Général";
    }
  }

  function getTypeColor(
    type
  ) {
    switch (type) {
      case "vision":
        return "info";

      case "conversation":
        return "success";

      default:
        return "default";
    }
  }

  function formatDate(
    date
  ) {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "fr-FR",
        {
          dateStyle:
            "short",
          timeStyle:
            "short",
        }
      );
    } catch {
      return "";
    }
  }

  function handleClearMemory() {
    const confirmed =
      window.confirm(
        "Voulez-vous vraiment effacer toute la mémoire de Lyssia ? Cette action est irréversible."
      );

    if (!confirmed) {
      return;
    }

    clearMemories();
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight:
          "100%",

        display:
          "flex",

        flexDirection:
          "column",

        gap: 3,
      }}
    >
      {/* =================================================
          EN-TÊTE
         ================================================= */}

      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Mémoire de Lyssia
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color:
              "#94a3b8",
          }}
        >
          Les souvenirs et perceptions que Lyssia
          conserve.
        </Typography>
      </Box>

      {/* =================================================
          STATISTIQUES
         ================================================= */}

      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns:
            {
              xs:
                "1fr",
              sm:
                "repeat(3, 1fr)",
            },

          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography
              sx={{
                color:
                  "#94a3b8",
                fontSize:
                  14,
              }}
            >
              Souvenirs
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight:
                  700,
              }}
            >
              {memories.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              sx={{
                color:
                  "#94a3b8",
                fontSize:
                  14,
              }}
            >
              Perceptions Vision
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight:
                  700,
              }}
            >
              {
                memories.filter(
                  (memory) =>
                    memory.type ===
                    "vision"
                ).length
              }
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              sx={{
                color:
                  "#94a3b8",
                fontSize:
                  14,
              }}
            >
              Conversations
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight:
                  700,
              }}
            >
              {
                memories.filter(
                  (memory) =>
                    memory.type ===
                    "conversation"
                ).length
              }
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* =================================================
          RECHERCHE / FILTRES
         ================================================= */}

      <Card>
        <CardContent>
          <Stack
            direction={{
              xs:
                "column",
              md:
                "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher dans la mémoire..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography>
                        🔎
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select
              value={
                typeFilter
              }
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
              sx={{
                minWidth: 190,
              }}
            >
              <MenuItem value="all">
                Tous les souvenirs
              </MenuItem>

              <MenuItem value="vision">
                Vision
              </MenuItem>

              <MenuItem value="conversation">
                Conversation
              </MenuItem>

              <MenuItem value="general">
                Général
              </MenuItem>
            </Select>

            <Select
              value={
                categoryFilter
              }
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              sx={{
                minWidth: 190,
              }}
            >
              <MenuItem value="all">
                Toutes catégories
              </MenuItem>

              <MenuItem value="episodic">
                Épisodique
              </MenuItem>

              <MenuItem value="semantic">
                Sémantique
              </MenuItem>
            </Select>

            <Button
              variant="outlined"
              color="error"
              onClick={
                handleClearMemory
              }
              disabled={
                memories.length ===
                0
              }
              sx={{
                whiteSpace:
                  "nowrap",
              }}
            >
              🗑️ Effacer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
          LISTE DES SOUVENIRS
         ================================================= */}

      <Card
        sx={{
          flex: 1,
          overflow:
            "hidden",
        }}
      >
        <CardContent
          sx={{
            p: 0,

            "&:last-child": {
              pb: 0,
            },
          }}
        >
          {filteredMemories.length ===
          0 ? (
            <Box
              sx={{
                p: 5,

                textAlign:
                  "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight:
                    600,
                }}
              >
                {memories.length ===
                0
                  ? "La mémoire est vide."
                  : "Aucun souvenir trouvé."}
              </Typography>

              <Typography
                sx={{
                  mt: 1,

                  color:
                    "#94a3b8",
                }}
              >
                {memories.length ===
                0
                  ? "Les souvenirs importants de Lyssia apparaîtront ici."
                  : "Essaie une autre recherche ou un autre filtre."}
              </Typography>
            </Box>
          ) : (
            <Stack
              divider={
                <Divider />
              }
            >
              {filteredMemories.map(
                (memory) => (
                  <Box
                    key={
                      memory.id
                    }
                    sx={{
                      p: 2.5,

                      display:
                        "flex",

                      gap: 2,

                      alignItems:
                        "flex-start",

                      "&:hover": {
                        background:
                          "rgba(89,217,255,0.035)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth:
                          0,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          mb: 1,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <Chip
                          size="small"
                          label={getTypeLabel(
                            memory.type
                          )}
                          color={getTypeColor(
                            memory.type
                          )}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={getCategoryLabel(
                            memory.category
                          )}
                          color={getCategoryColor(
                            memory.category
                          )}
                        />

                        {memory.importance && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              memory.importance
                            }
                          />
                        )}

                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              "#64748b",

                            alignSelf:
                              "center",
                          }}
                        >
                          {formatDate(
                            memory.createdAt
                          )}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          color:
                            "#e2e8f0",

                          lineHeight:
                            1.6,

                          wordBreak:
                            "break-word",
                        }}
                      >
                        {
                          memory.content
                        }
                      </Typography>

                      {memory.source && (
                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              "block",

                            mt: 1,

                            color:
                              "#64748b",
                          }}
                        >
                          Source :{" "}
                          {
                            memory.source
                          }
                        </Typography>
                      )}
                    </Box>

                    <IconButton
                      color="error"
                      onClick={() =>
                        deleteMemory(
                          memory.id
                        )
                      }
                      aria-label="Supprimer le souvenir"
                    >
                      🗑️
                    </IconButton>
                  </Box>
                )
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
